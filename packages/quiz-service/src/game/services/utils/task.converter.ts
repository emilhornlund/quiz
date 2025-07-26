import {
  calculateRangeMargin,
  GameMode,
  GameParticipantType,
  QuestionRangeAnswerMargin,
  QuestionType,
} from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import {
  BaseQuestionDao,
  QuestionDao,
  QuestionRangeDao,
} from '../../../quiz/repositories/models/schemas'
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
  Participant,
  ParticipantBase,
  ParticipantPlayer,
  PodiumTask,
  QuestionResultTask,
  QuestionResultTaskCorrectAnswer,
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
} from '../../repositories/models/schemas'

import {
  isMultiChoiceAnswer,
  isMultiChoiceCorrectAnswer,
  isRangeAnswer,
  isRangeCorrectAnswer,
  isTrueFalseAnswer,
  isTrueFalseCorrectAnswer,
  isTypeAnswerAnswer,
  isTypeAnswerCorrectAnswer,
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
 * Determines if a player's answer is correct based on the provided correct answers.
 *
 * Handles all supported question types:
 * - MultiChoice: Matches selected option index against correct indices.
 * - Range: Compares numeric value with margin consideration.
 * - TrueFalse: Matches boolean value.
 * - TypeAnswer: Compares lowercase trimmed string values.
 *
 * @param correctAnswers - An array of correct answers for the current question.
 * @param answer - The player's submitted answer.
 * @param margin - Optional margin for range-type questions.
 * @returns `true` if the answer is correct; otherwise `false`.
 */
export function isQuestionAnswerCorrect(
  correctAnswers: QuestionResultTaskCorrectAnswer[],
  answer?: QuestionTaskAnswer,
  margin?: QuestionRangeAnswerMargin,
): boolean {
  if (isMultiChoiceAnswer(answer)) {
    return correctAnswers
      .filter(isMultiChoiceCorrectAnswer)
      .some((correctAnswer) => correctAnswer.index === answer.answer)
  }

  if (isRangeAnswer(answer)) {
    return correctAnswers.filter(isRangeCorrectAnswer).some(({ value }) => {
      if (!margin || margin === QuestionRangeAnswerMargin.None) {
        return value === answer.answer
      }
      const rangeMargin = calculateRangeMargin(margin, value)
      return Math.abs(value - answer.answer) <= rangeMargin
    })
  }

  if (isTrueFalseAnswer(answer)) {
    return correctAnswers
      .filter(isTrueFalseCorrectAnswer)
      .some(({ value }) => value === answer.answer)
  }

  if (isTypeAnswerAnswer(answer)) {
    return correctAnswers
      .filter(isTypeAnswerCorrectAnswer)
      .some(
        ({ value }) =>
          !!value &&
          !!answer?.answer &&
          value.toLowerCase() === answer.answer.trim().toLowerCase(),
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
 * Calculates the score for a Range question in Classic mode.
 *
 * Score is a combination of:
 * 1. Speed-based score (20% of total points)
 * 2. Precision-based score (80%), reduced based on distance from the correct answer.
 *
 * @param correctAnswers - List of correct range values to compare against.
 * @param presented - The timestamp when the question was presented.
 * @param question - The range question object with correct value, margin, and points.
 * @param answer - The player's submitted range answer.
 * @returns The total score based on precision and response speed.
 */
export function calculateClassicModeRangeQuestionScore(
  correctAnswers: QuestionResultTaskCorrectAnswer[],
  presented: Date,
  question: BaseQuestionDao & QuestionRangeDao,
  answer: QuestionTaskBaseAnswer & QuestionTaskRangeAnswer,
): number {
  const { margin, points } = question
  const { answer: userAnswer } = answer

  // If the answer is not correct based on the question logic, return 0
  if (!isQuestionAnswerCorrect(correctAnswers, answer, margin)) {
    return 0
  }

  // Calculate speed-based score (20%)
  const speedScore =
    calculateClassicModeRawScore(presented, question, answer) * 0.2

  // Special handling for None margin (exact match required)
  if (margin === QuestionRangeAnswerMargin.None) {
    return Math.round(speedScore + points * 0.8) // Full precision score for exact matches
  }

  const scores = correctAnswers
    .filter(isRangeCorrectAnswer)
    .map(({ value }) => {
      // For other margins, calculate precision-based score (80%)
      const difference = Math.abs(value - userAnswer)
      const rangeMargin = calculateRangeMargin(margin, value)

      const precisionMultiplier =
        difference > rangeMargin ? 0 : 1 - difference / rangeMargin

      const precisionScore = points * precisionMultiplier * 0.8

      // Total score: sum of speed and precision scores
      return Math.round(speedScore + precisionScore)
    })
    .sort((lhs, rhs) => rhs - lhs)

  return scores[0] ?? 0
}

/**
 * Calculates the score for a player's answer in Classic mode.
 *
 * - Range questions use a margin-based precision scoring function.
 * - All other types use raw speed-based scoring after correctness validation.
 *
 * @param presented - The timestamp when the question was presented.
 * @param question - The question being answered.
 * @param correctAnswers - List of correct answers to validate against.
 * @param answer - The player's submitted answer.
 * @returns The computed score, or 0 if the answer is incorrect.
 */
export function calculateClassicModeScore(
  presented: Date,
  question: QuestionDao,
  correctAnswers: QuestionResultTaskCorrectAnswer[],
  answer?: QuestionTaskBaseAnswer &
    (
      | QuestionTaskMultiChoiceAnswer
      | QuestionTaskRangeAnswer
      | QuestionTaskTrueFalseAnswer
      | QuestionTaskTypeAnswerAnswer
    ),
): number {
  if (isRangeQuestion(question) && isRangeAnswer(answer)) {
    return calculateClassicModeRangeQuestionScore(
      correctAnswers,
      presented,
      question,
      answer,
    )
  }

  if (!isQuestionAnswerCorrect(correctAnswers, answer, undefined)) {
    return 0
  }

  const rawScore = calculateClassicModeRawScore(presented, question, answer)
  return Math.round(rawScore)
}

/**
 * Calculates the score for a Range question in "Zero to One Hundred" mode.
 *
 * - Returns -10 for exact matches.
 * - Returns absolute difference for other answers within [0, 100].
 * - Returns 100 for invalid or out-of-range answers.
 *
 * @param correctAnswers - List of correct numeric values to validate against.
 * @param question - The question being answered.
 * @param answer - The player's submitted answer.
 * @returns A score between -10 and 100 based on proximity or correctness.
 */
export function calculateZeroToOneHundredModeScore(
  correctAnswers: QuestionResultTaskCorrectAnswer[],
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

  const scores = correctAnswers
    .filter(isRangeCorrectAnswer)
    .map(({ value }) => {
      // Return max penalty if out of range
      if (answer.answer < 0 || answer.answer > 100) {
        return 100
      }

      // Return -10 for exact match
      if (answer.answer === value) {
        return -10
      }

      // Return absolute difference otherwise
      return Math.abs(answer.answer - value)
    })
    .sort((lhs, rhs) => lhs - rhs)

  // Return lowest score or 100 if no scores available
  return scores[0] ?? 100
}

/**
 * Extracts the correct answer(s) for the current question in the game.
 *
 * Handles all supported question types (MultiChoice, Range, TrueFalse, TypeAnswer),
 * returning a normalized representation of each correct answer for inclusion in the result task.
 *
 * @param gameDocument - The current game document, including the question task.
 * @returns An array of `QuestionResultTaskCorrectAnswer` representing the correct answer(s).
 */
function buildInitialQuestionResultTaskCorrectAnswers(
  gameDocument: GameDocument & { currentTask: { type: TaskType.Question } },
): QuestionResultTaskCorrectAnswer[] {
  const { questionIndex } = gameDocument.currentTask
  const question = gameDocument.questions[questionIndex]

  if (isMultiChoiceQuestion(question)) {
    return question.options
      .map((option, index) =>
        option.correct ? { type: QuestionType.MultiChoice, index } : undefined,
      )
      .filter((option) => !!option)
  }
  if (isRangeQuestion(question)) {
    return [{ type: QuestionType.Range, value: question.correct }]
  }
  if (isTrueFalseQuestion(question)) {
    return [{ type: QuestionType.TrueFalse, value: question.correct }]
  }
  if (isTypeAnswerQuestion(question)) {
    return question.options.map((option) => ({
      type: QuestionType.TypeAnswer,
      value: option,
    }))
  }

  return []
}

/**
 * Constructs a new `QuestionResultTask` based on the current active question task.
 *
 * This function is typically used during normal gameplay after a question is completed.
 * It evaluates all player answers, calculates scores and correctness, and assigns positions.
 * The task includes the correct answers and is ready to be emitted or persisted.
 *
 * @param gameDocument - The current game state containing the active question task and answers.
 * @returns A fully populated `QuestionResultTask` with correct answers and scored results.
 *
 * @throws {IllegalTaskTypeException} If the current task is not of type `Question`.
 */
export function buildQuestionResultTask(
  gameDocument: GameDocument,
): BaseTask & QuestionResultTask {
  if (!isQuestionTask(gameDocument)) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.Question,
    )
  }

  const { mode, questions, participants } = gameDocument
  const { questionIndex, presented, answers } = gameDocument.currentTask
  const question = questions[questionIndex]

  const correctAnswers =
    buildInitialQuestionResultTaskCorrectAnswers(gameDocument)

  const results = buildQuestionResultTaskResults({
    mode,
    participants,
    question,
    presented,
    correctAnswers,
    answers,
  })

  return {
    _id: uuidv4(),
    type: TaskType.QuestionResult,
    status: 'pending',
    questionIndex,
    correctAnswers,
    results,
    created: new Date(),
  }
}

/**
 * Recomputes the `results` of an existing `QuestionResultTask` using data from the preceding `Question` task.
 *
 * This function is useful when needing to restore or recalculate results from a previously created result task.
 * It uses the preserved correct answers and answers from the previous task to regenerate the final result items.
 *
 * @param gameDocument - The game document where the current task is of type `QuestionResult`
 *                       and the previous task is of type `Question`.
 * @returns A `QuestionResultTask` with newly rebuilt results while preserving task metadata.
 *
 * @throws {IllegalTaskTypeException} If the current task is not a `QuestionResult` or the previous task is not a `Question`.
 */
export function rebuildQuestionResultTask(
  gameDocument: GameDocument,
): BaseTask & QuestionResultTask {
  if (!isQuestionResultTask(gameDocument)) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.QuestionResult,
    )
  }

  const { mode, questions, participants } = gameDocument

  const previousTask =
    gameDocument.previousTasks?.[gameDocument.previousTasks.length - 1]
  if (previousTask?.type !== TaskType.Question) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.Question,
    )
  }

  const { questionIndex, presented, answers } = previousTask
  const question = questions[questionIndex]

  const { correctAnswers } = gameDocument.currentTask

  const results = buildQuestionResultTaskResults({
    mode,
    participants,
    question,
    presented,
    correctAnswers,
    answers,
  })

  return {
    ...gameDocument.currentTask,
    results,
  }
}

/**
 * Builds and ranks the result items for each player in a question round.
 *
 * This function filters out player participants, retrieves their answers,
 * evaluates correctness, computes scores, and assigns positional rankings.
 *
 * @param mode - The game mode (`Classic` or `ZeroToOneHundred`), which determines the scoring strategy.
 * @param participants - All game participants; only players are included in the result.
 * @param question - The current question being evaluated.
 * @param presented - The timestamp when the question was shown.
 * @param correctAnswers - The list of correct answers for the question.
 * @param answers - All submitted player answers for the question.
 * @returns A sorted list of `QuestionResultTaskItem`s with calculated scores and positions.
 */
function buildQuestionResultTaskResults({
  mode,
  participants,
  question,
  presented,
  correctAnswers,
  answers,
}: {
  mode: GameMode
  participants: Participant[]
  question: QuestionDao
  presented: Date
  correctAnswers: QuestionResultTaskCorrectAnswer[]
  answers: QuestionTaskAnswer[]
}): QuestionResultTaskItem[] {
  return participants
    .filter((participant) => participant.type === GameParticipantType.PLAYER)
    .map((participant) => {
      const answer = answers.find(
        ({ playerId }) => playerId === participant.participantId,
      )
      return buildQuestionResultTaskItem(
        mode,
        presented,
        participant,
        question,
        correctAnswers,
        answer,
      )
    })
    .sort((a, b) =>
      mode === GameMode.Classic
        ? compareSortClassicModeQuestionResultTaskItemByScore(a, b)
        : compareZeroToOneHundredModeQuestionResultTaskItemByScore(a, b),
    )
    .map((item, index) => ({ ...item, position: index + 1 }))
}

/**
 * Builds a `QuestionResultTaskItem` for a given player and their answer.
 *
 * Evaluates correctness, calculates scores, and includes player-specific stats.
 *
 * @param mode - description here.
 * @param presented - description here.
 * @param participantPlayer - The player participant for whom the result is being calculated.
 * @param question - The question associated with the current task.
 * @param correctAnswers - The list of correct answers for the question.
 * @param answer - The answer provided by the player to the current question.
 * @returns A `QuestionResultTaskItem` containing the player's performance on the question.
 */
function buildQuestionResultTaskItem(
  mode: GameMode,
  presented: Date,
  participantPlayer: ParticipantBase & ParticipantPlayer,
  question: QuestionDao,
  correctAnswers: QuestionResultTaskCorrectAnswer[],
  answer: QuestionTaskAnswer,
): QuestionResultTaskItem {
  const {
    participantId,
    nickname,
    totalScore: previousScore,
    currentStreak,
  } = participantPlayer

  const { type } = question

  const margin = isRangeQuestion(question) ? question.margin : undefined

  const correct = isQuestionAnswerCorrect(correctAnswers, answer, margin)

  const lastScore =
    mode === GameMode.Classic
      ? calculateClassicModeScore(presented, question, correctAnswers, answer)
      : calculateZeroToOneHundredModeScore(correctAnswers, question, answer)

  const totalScore = previousScore + lastScore

  const streak = correct ? currentStreak + 1 : 0

  return {
    type,
    playerId: participantId,
    nickname,
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
    .map(
      (
        { participantId, nickname, totalScore: score, currentStreak: streaks },
        index,
      ) => ({
        playerId: participantId,
        nickname,
        position: index + 1,
        score,
        streaks,
      }),
    )
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
        ({ playerId }) => playerId === participant.participantId,
      )
      if (resultEntry) {
        participant.rank = resultEntry.position
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
