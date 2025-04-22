import {
  GameMode,
  GameParticipantType,
  QuestionRangeAnswerMargin,
} from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import {
  BaseQuestionDao,
  QuestionDao,
  QuestionRangeDao,
} from '../../../quiz/services/models/schemas'
import {
  isMultiChoiceQuestion,
  isRangeQuestion,
  isTrueFalseQuestion,
  isTypeAnswerQuestion,
} from '../../../quiz/services/utils'
import { IllegalTaskTypeException } from '../../exceptions'
import {
  BaseTask,
  GameDocument,
  LeaderboardTask,
  LeaderboardTaskItem,
  LobbyTask,
  ParticipantBase,
  ParticipantPlayer,
  PodiumTask,
  QuestionResultTask,
  QuestionResultTaskItem,
  QuestionTask,
  QuestionTaskAnswer,
  QuestionTaskBaseAnswer,
  QuestionTaskMultiChoiceAnswer,
  QuestionTaskRangeAnswer,
  QuestionTaskTrueFalseAnswer,
  QuestionTaskTypeAnswerAnswer,
  QuitTask,
  TaskType,
} from '../models/schemas'

import {
  isMultiChoiceAnswer,
  isRangeAnswer,
  isTrueFalseAnswer,
  isTypeAnswerAnswer,
} from './question-answer.utils'
import { isQuestionResultTask, isQuestionTask } from './task.utils'

/**
 * Constructs a new lobby task with a unique ID, setting its initial status and creation timestamp.
 *
 * @returns {BaseTask & LobbyTask} A new lobby task object.
 */
export function buildLobbyTask(): BaseTask & LobbyTask {
  return {
    _id: uuidv4(),
    type: TaskType.Lobby,
    status: 'pending',
    created: new Date(),
  }
}

/**
 * Constructs a new question task based on the provided game document.
 *
 * @param {GameDocument} gameDocument - The current game document.
 *
 * @returns {BaseTask & QuestionTask} A new question task object.
 */
export function buildQuestionTask(
  gameDocument: GameDocument,
): BaseTask & QuestionTask {
  return {
    _id: uuidv4(),
    type: TaskType.Question,
    status: 'pending',
    questionIndex: gameDocument.nextQuestion,
    answers: [],
    created: new Date(),
  }
}

/**
 * Calculates the acceptable margin value for a range question based on the given margin type.
 * This determines the range around the correct answer that is considered valid.
 *
 * @param {QuestionRangeAnswerMargin} margin - The margin type (None, Low, Medium, High, Maximum).
 * @param {number} correct - The correct answer value for the range question.
 *
 * @returns {number} - The calculated margin value. If the margin is Maximum, returns `Number.MAX_VALUE`.
 *                     If the margin is None, returns `0`.
 *
 * @example
 * calculateRangeMargin(QuestionRangeAnswerMargin.Low, 100) // Returns 5 (5% of 100)
 * calculateRangeMargin(QuestionRangeAnswerMargin.Medium, 100) // Returns 10 (10% of 100)
 * calculateRangeMargin(QuestionRangeAnswerMargin.High, 100) // Returns 20 (20% of 100)
 * calculateRangeMargin(QuestionRangeAnswerMargin.Maximum, 100) // Returns Number.MAX_VALUE
 * calculateRangeMargin(QuestionRangeAnswerMargin.None, 100) // Returns 0
 */
export function calculateRangeMargin(
  margin: QuestionRangeAnswerMargin,
  correct: number,
): number {
  switch (margin) {
    case QuestionRangeAnswerMargin.Low:
      return Math.abs(correct) * 0.05 // 5%
    case QuestionRangeAnswerMargin.Medium:
      return Math.abs(correct) * 0.1 // 10%
    case QuestionRangeAnswerMargin.High:
      return Math.abs(correct) * 0.2 // 20%
    case QuestionRangeAnswerMargin.Maximum:
      return Number.MAX_VALUE // Accept all answers
    default:
      return 0 // None or invalid margin type
  }
}

/**
 * Determines if the provided answer is correct for the given question.
 *
 * - Multi-choice questions: Validates that the selected option is correct.
 * - Range questions: Validates if the answer falls within the allowed margin.
 * - True/False questions: Checks if the answer matches the correct boolean value.
 * - Type answer questions: Compares the lowercased correct answer and provided answer.
 *
 * @param {QuestionDao} question - The question object to check against.
 * @param {QuestionTaskBaseAnswer & (QuestionTaskMultiChoiceAnswer | QuestionTaskRangeAnswer | QuestionTaskTrueFalseAnswer | QuestionTaskTypeAnswerAnswer)} answer - The optional answer object to validate.
 *
 * @returns {boolean} Returns `true` if the answer is correct for the given question, otherwise `false`.
 */
export function isQuestionAnswerCorrect(
  question: QuestionDao,
  answer?: QuestionTaskBaseAnswer &
    (
      | QuestionTaskMultiChoiceAnswer
      | QuestionTaskRangeAnswer
      | QuestionTaskTrueFalseAnswer
      | QuestionTaskTypeAnswerAnswer
    ),
): boolean {
  if (isMultiChoiceQuestion(question) && isMultiChoiceAnswer(answer)) {
    const optionsIndex = answer.answer
    if (optionsIndex >= 0 && optionsIndex < question.options.length) {
      return question.options[optionsIndex].correct
    }
  }
  if (isRangeQuestion(question) && isRangeAnswer(answer)) {
    const { margin, correct } = question
    const { answer: playerAnswer } = answer

    if (margin === QuestionRangeAnswerMargin.None) {
      return correct === playerAnswer
    }

    const rangeMargin = calculateRangeMargin(margin, correct)

    return Math.abs(correct - playerAnswer) <= rangeMargin
  }
  if (isTrueFalseQuestion(question) && isTrueFalseAnswer(answer)) {
    return question.correct === answer.answer
  }
  if (isTypeAnswerQuestion(question) && isTypeAnswerAnswer(answer)) {
    return !!(
      answer?.answer?.length &&
      question.options.some(
        (option) =>
          !!option?.length &&
          option.trim().toLowerCase() === answer.answer.trim().toLowerCase(),
      )
    )
  }
  return false
}

/**
 * Calculates the raw score for a question in classic mode based on the response time.
 *
 * The faster the response, the higher the score. The score is reduced based on the
 * time taken relative to the question's duration, with a minimum multiplier of 0
 * for responses that exceed the question's duration.
 *
 * @param {Date} presented - The time when the question was presented.
 * @param {QuestionDao} question - The question object containing duration and points.
 * @param {QuestionTaskBaseAnswer & (QuestionTaskMultiChoiceAnswer | QuestionTaskRangeAnswer | QuestionTaskTrueFalseAnswer | QuestionTaskTypeAnswerAnswer)} answer - The user's answer, including the time it was created.
 *
 * @returns {number} - The raw score calculated based on response time and the maximum points for the question.
 */
export function calculateClassicModeRawScore(
  presented: Date,
  question: QuestionDao,
  answer?: QuestionTaskBaseAnswer &
    (
      | QuestionTaskMultiChoiceAnswer
      | QuestionTaskRangeAnswer
      | QuestionTaskTrueFalseAnswer
      | QuestionTaskTypeAnswerAnswer
    ),
): number {
  const { duration, points } = question
  const { created: answered } = answer || {}

  if (
    !answered ||
    !duration ||
    !points ||
    answered.getTime() < presented.getTime() ||
    answered.getTime() > presented.getTime() + duration * 1000
  ) {
    return 0
  }

  // Calculate the response time in seconds
  const responseTime = (answered.getTime() - presented.getTime()) / 1000

  // Ensure response time doesn't exceed the duration
  const normalizedTime = Math.min(responseTime, duration)

  // Step 1: Divide response time by the question timer
  const responseRatio = normalizedTime / duration

  // Step 2: Divide that value by 2
  const adjustment = responseRatio / 2

  // Step 3: Subtract that value from 1
  const scoreMultiplier = 1 - adjustment

  // Step 4: Multiply points possible by that value
  return points * scoreMultiplier
}

/**
 * Calculates the total score for a range question in classic mode.
 *
 * The score is determined by two factors:
 * 1. **Speed-based score (20%)**: A portion of the score is derived from the speed of the user's response,
 *    as calculated by `calculateClassicModeRawScore`.
 * 2. **Precision-based score (80%)**: A portion of the score is based on how close the user's answer is
 *    to the correct answer, within the allowed margin.
 *
 * @param {Date} presented - The time when the question was presented.
 * @param {BaseQuestionDao & QuestionRangeDao} question - The range question object, including the correct answer, margin, and points.
 * @param {QuestionTaskBaseAnswer & QuestionTaskRangeAnswer} answer - The user's range answer, including the provided answer value.
 *
 * @returns {number} - The calculated total score for the range question.
 */
export function calculateClassicModeRangeQuestionScore(
  presented: Date,
  question: BaseQuestionDao & QuestionRangeDao,
  answer: QuestionTaskBaseAnswer & QuestionTaskRangeAnswer,
): number {
  const { correct, margin, points } = question
  const { answer: userAnswer } = answer

  // If the answer is not correct based on the question logic, return 0
  if (!isQuestionAnswerCorrect(question, answer)) {
    return 0
  }

  // Calculate speed-based score (20%)
  const speedScore =
    calculateClassicModeRawScore(presented, question, answer) * 0.2

  // Special handling for None margin (exact match required)
  if (margin === QuestionRangeAnswerMargin.None) {
    return Math.round(speedScore + points * 0.8) // Full precision score for exact matches
  }

  // For other margins, calculate precision-based score (80%)
  const difference = Math.abs(correct - userAnswer)
  const rangeMargin = calculateRangeMargin(margin, correct)

  const precisionMultiplier =
    difference > rangeMargin ? 0 : 1 - difference / rangeMargin

  const precisionScore = points * precisionMultiplier * 0.8

  // Total score: sum of speed and precision scores
  return Math.round(speedScore + precisionScore)
}

/**
 * Calculates the player's score for Classic mode based on their response time and question type.
 *
 * - For range questions, the score is calculated using `calculateClassicModeRangeQuestionScore`,
 *   which considers both speed and precision.
 * - For other question types, the score is calculated using `calculateClassicModeRawScore`,
 *   which only considers speed.
 *
 * @param {Date} presented - The timestamp when the question was presented.
 * @param {QuestionDao} question - The question object to check against.
 * @param {QuestionTaskBaseAnswer & (QuestionTaskMultiChoiceAnswer | QuestionTaskRangeAnswer | QuestionTaskTrueFalseAnswer | QuestionTaskTypeAnswerAnswer)} answer - The optional answer object to validate.
 *
 * @returns {number} - The player's calculated score, rounded to the nearest whole number.
 *
 * @remarks
 * - For range questions, the calculation includes a precision component.
 * - For other types, only response time affects the score.
 */
export function calculateClassicModeScore(
  presented: Date,
  question: QuestionDao,
  answer?: QuestionTaskBaseAnswer &
    (
      | QuestionTaskMultiChoiceAnswer
      | QuestionTaskRangeAnswer
      | QuestionTaskTrueFalseAnswer
      | QuestionTaskTypeAnswerAnswer
    ),
): number {
  if (isRangeQuestion(question) && isRangeAnswer(answer)) {
    return calculateClassicModeRangeQuestionScore(presented, question, answer)
  }

  if (!isQuestionAnswerCorrect(question, answer)) {
    return 0
  }

  const rawScore = calculateClassicModeRawScore(presented, question, answer)
  return Math.round(rawScore)
}

/**
 * Calculates the player's score for ZeroToOneHundred mode.
 *
 * - A correct answer gives a score of `-10` (lower score is better).
 * - For incorrect answers within the range [0, 100], the score is the absolute difference
 *   between the correct answer and the player's answer.
 * - Answers outside the range [0, 100] or invalid answers default to a score of `100`.
 *
 * @param {QuestionDao} question - The question object to check against.
 * @param {QuestionTaskBaseAnswer & (QuestionTaskMultiChoiceAnswer | QuestionTaskRangeAnswer | QuestionTaskTrueFalseAnswer | QuestionTaskTypeAnswerAnswer)} answer - The optional answer object to validate.
 *
 * @returns {number} - The player's score:
 *   - `-10` for correct answers.
 *   - Absolute difference for incorrect answers within [0, 100].
 *   - `100` for invalid or out-of-range answers.
 */
export function calculateZeroToOneHundredModeScore(
  question: QuestionDao,
  answer?: QuestionTaskBaseAnswer &
    (
      | QuestionTaskMultiChoiceAnswer
      | QuestionTaskRangeAnswer
      | QuestionTaskTrueFalseAnswer
      | QuestionTaskTypeAnswerAnswer
    ),
): number {
  // Return max penalty if question or answer is invalid
  if (!isRangeQuestion(question) || !isRangeAnswer(answer)) {
    return 100
  }

  const { correct } = question
  const { answer: playerAnswer } = answer

  // Return max penalty if out of range
  if (playerAnswer < 0 || playerAnswer > 100) {
    return 100
  }

  // Return -10 for correct answers
  if (playerAnswer === correct) {
    return -10
  }

  // Return absolute difference for incorrect answers within range
  return Math.abs(playerAnswer - correct)
}

/**
 * Constructs a new question result task based on the provided game document.
 *
 * @param {GameDocument} gameDocument - The current game document.
 * @param {QuestionTaskAnswer[]} answers - The list of answers submitted for the question task.
 *
 * @throws {IllegalTaskTypeException} If the current task type is not a question.
 *
 * @returns {BaseTask & QuestionResultTask} A new question result task object.
 */
export function buildQuestionResultTask(
  gameDocument: GameDocument,
  answers: QuestionTaskAnswer[],
): BaseTask & QuestionResultTask {
  if (!isQuestionTask(gameDocument)) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.Question,
    )
  }

  const { questionIndex } = gameDocument.currentTask
  const question = gameDocument.questions[questionIndex]

  const results: QuestionResultTaskItem[] = gameDocument.participants
    .filter((participant) => participant.type === GameParticipantType.PLAYER)
    .map((participant) => {
      const answer = answers.find(
        ({ playerId }) => playerId === participant.client.player._id,
      )
      return buildQuestionResultTaskItem(
        gameDocument,
        participant,
        question,
        answer,
      )
    })
    .sort((a, b) =>
      gameDocument.mode === GameMode.Classic
        ? compareSortClassicModeQuestionResultTaskItemByScore(a, b)
        : compareZeroToOneHundredModeQuestionResultTaskItemByScore(a, b),
    )
    .map((item, index) => ({ ...item, position: index + 1 }))

  return {
    _id: uuidv4(),
    type: TaskType.QuestionResult,
    status: 'pending',
    questionIndex,
    results,
    created: new Date(),
  }
}

/**
 * Builds a `QuestionResultTaskItem` for a given player and their answer.
 *
 * Calculates correctness, score, total score, and streak based on the provided game state.
 *
 * @param gameDocument - The current game document including task and mode information.
 * @param participant - The player participant for whom the result is being calculated.
 * @param question - The question associated with the current task.
 * @param answer - The answer provided by the player to the current question.
 * @returns A `QuestionResultTaskItem` containing the player's performance on the question.
 */
function buildQuestionResultTaskItem(
  gameDocument: GameDocument & { currentTask: { type: TaskType.Question } },
  participant: ParticipantBase & ParticipantPlayer,
  question: QuestionDao,
  answer: QuestionTaskAnswer,
): QuestionResultTaskItem {
  const { _id: playerId } = participant.client.player

  const { presented } = gameDocument.currentTask

  const { type } = question

  const correct = isQuestionAnswerCorrect(question, answer)

  const lastScore =
    gameDocument.mode === GameMode.Classic
      ? calculateClassicModeScore(presented, question, answer)
      : calculateZeroToOneHundredModeScore(question, answer)

  const totalScore = participant.totalScore + lastScore

  const streak = correct ? participant.currentStreak + 1 : 0

  return {
    type,
    playerId,
    answer,
    correct,
    lastScore,
    totalScore,
    position: 0,
    streak,
  }
}

/**
 * Compares two scores in Classic mode for sorting in descending order.
 *
 * @param {number} lhs - The left-hand score.
 * @param {number} rhs - The right-hand score.
 *
 * @returns {number} A positive value if `lhs` is less than `rhs`, a negative value if greater, or 0 if they are equal.
 */
function compareSortClassicModeScores(lhs: number, rhs: number): number {
  if (lhs < rhs) {
    return 1
  }
  if (lhs > rhs) {
    return -1
  }
  return 0
}

/**
 * Compares two question result task items by their total scores in Classic mode.
 *
 * @param {QuestionResultTaskItem} lhs - The first question result task item to compare.
 * @param {QuestionResultTaskItem} rhs - The second question result task item to compare.
 *
 * @returns {number} A positive value if `lhs` has a lower score, a negative value if higher, or 0 if they are equal.
 */
function compareSortClassicModeQuestionResultTaskItemByScore(
  lhs: QuestionResultTaskItem,
  rhs: QuestionResultTaskItem,
): number {
  return compareSortClassicModeScores(lhs.totalScore, rhs.totalScore)
}

/**
 * Compares two players by their total scores in Classic mode.
 *
 * @param {ParticipantBase & ParticipantPlayer} lhs - The first player participant to compare.
 * @param {ParticipantBase & ParticipantPlayer} rhs - The second player participant to compare.
 *
 * @returns {number} A positive value if `lhs` has a lower score, a negative value if higher, or 0 if they are equal.
 */
function compareSortClassicModePlayersByScore(
  lhs: ParticipantBase & ParticipantPlayer,
  rhs: ParticipantBase & ParticipantPlayer,
): number {
  return compareSortClassicModeScores(lhs.totalScore, rhs.totalScore)
}

/**
 * Compares two question result task items by their total scores in ZeroToOneHundred mode.
 *
 * @param {QuestionResultTaskItem} lhs - The first question result task item to compare.
 * @param {QuestionResultTaskItem} rhs - The second question result task item to compare.
 *
 * @returns {number} A positive value if `lhs` has a higher score, a negative value if lower, or 0 if they are equal.
 *
 * @remarks
 * This reverses the sort order compared to Classic mode, sorting from lowest to highest.
 */
function compareZeroToOneHundredModeQuestionResultTaskItemByScore(
  lhs: QuestionResultTaskItem,
  rhs: QuestionResultTaskItem,
): number {
  return compareSortClassicModeQuestionResultTaskItemByScore(lhs, rhs) * -1 //sort scores from lowest to highest
}

/**
 * Compares two players by their total scores in ZeroToOneHundred mode.
 *
 * @param {ParticipantBase & ParticipantPlayer} lhs - The first player participant to compare.
 * @param {ParticipantBase & ParticipantPlayer} rhs - The second player participant to compare.
 *
 * @returns {number} A positive value if `lhs` has a higher score, a negative value if lower, or 0 if they are equal.
 *
 * @remarks
 * This reverses the sort order compared to Classic mode, sorting from lowest to highest.
 */
function compareZeroToOneHundredModePlayersByScore(
  lhs: ParticipantBase & ParticipantPlayer,
  rhs: ParticipantBase & ParticipantPlayer,
): number {
  return compareSortClassicModePlayersByScore(lhs, rhs) * -1 //sort scores from lowest to highest
}

/**
 * Builds leaderboard items for the current game document, sorting players by score based on the game mode.
 *
 * @param {GameDocument} gameDocument - The current game document.
 *
 * @returns {LeaderboardTaskItem[]} An array of leaderboard task items.
 */
function buildLeaderboardItems(
  gameDocument: GameDocument,
): LeaderboardTaskItem[] {
  return gameDocument.participants
    .filter((participant) => participant.type === GameParticipantType.PLAYER)
    .sort((a, b) =>
      gameDocument.mode === GameMode.Classic
        ? compareSortClassicModePlayersByScore(a, b)
        : compareZeroToOneHundredModePlayersByScore(a, b),
    )
    .map((participant, index) => ({
      playerId: participant.client.player._id,
      nickname: participant.client.player.nickname,
      position: index + 1,
      score: participant.totalScore,
      streaks: participant.currentStreak,
    }))
}

/**
 * Updates the total score and current streak of each player based on the results from the current question task.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.QuestionResult } }} gameDocument - The game document containing the current question result task and player data.
 *
 * @returns {void} This function does not return a value; it modifies the `gameDocument` in place.
 */
function applyLastScore(
  gameDocument: GameDocument & {
    currentTask: { type: TaskType.QuestionResult }
  },
): void {
  gameDocument.participants
    .filter((participant) => participant.type === GameParticipantType.PLAYER)
    .forEach((participant) => {
      const resultEntry = gameDocument.currentTask.results.find(
        ({ playerId }) => playerId === participant.client.player._id,
      )
      if (resultEntry) {
        participant.totalScore = resultEntry.totalScore
        participant.currentStreak = resultEntry.streak
      }
    })
}

/**
 * Constructs a new leaderboard task based on the provided game document.
 *
 * @param {GameDocument} gameDocument - The current game document.
 *
 * @throws {IllegalTaskTypeException} If the current task type is not a question result.
 *
 * @returns {BaseTask & LeaderboardTask} A new leaderboard task object.
 */
export function buildLeaderboardTask(
  gameDocument: GameDocument,
): BaseTask & LeaderboardTask {
  if (!isQuestionResultTask(gameDocument)) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.QuestionResult,
    )
  }

  applyLastScore(gameDocument)

  return {
    _id: uuidv4(),
    type: TaskType.Leaderboard,
    status: 'pending',
    questionIndex: gameDocument.nextQuestion - 1,
    leaderboard: buildLeaderboardItems(gameDocument),
    created: new Date(),
  }
}

/**
 * Constructs a new podium task based on the provided game document.
 *
 * @param {GameDocument} gameDocument - The current game document.
 *
 * @throws {IllegalTaskTypeException} If the current task type is not a question result.
 *
 * @returns {BaseTask & PodiumTask} A new podium task object.
 */
export function buildPodiumTask(
  gameDocument: GameDocument,
): BaseTask & PodiumTask {
  if (!isQuestionResultTask(gameDocument)) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.QuestionResult,
    )
  }

  applyLastScore(gameDocument)

  return {
    _id: uuidv4(),
    type: TaskType.Podium,
    status: 'pending',
    leaderboard: buildLeaderboardItems(gameDocument),
    created: new Date(),
  }
}

/**
 * Constructs a new quit task, setting its initial status and creation timestamp.
 *
 * @returns {BaseTask & QuitTask} A new quit task object.
 */
export function buildQuitTask(): BaseTask & QuitTask {
  return {
    _id: uuidv4(),
    type: TaskType.Quit,
    status: 'completed',
    created: new Date(),
  }
}
