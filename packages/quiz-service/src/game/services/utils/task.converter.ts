import { GameMode } from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import { IllegalTaskTypeException } from '../../exceptions'
import {
  BaseQuestion,
  BaseTask,
  GameDocument,
  LeaderboardTask,
  LeaderboardTaskItem,
  LobbyTask,
  Player,
  PodiumTask,
  QuestionMultiChoice,
  QuestionRange,
  QuestionResultTask,
  QuestionResultTaskItem,
  QuestionTask,
  QuestionTaskBaseAnswer,
  QuestionTaskMultiChoiceAnswer,
  QuestionTaskRangeAnswer,
  QuestionTaskTrueFalseAnswer,
  QuestionTaskTypeAnswerAnswer,
  QuestionTrueFalse,
  QuestionTypeAnswer,
  TaskType,
} from '../models/schemas'

import {
  isMultiChoiceAnswer,
  isMultiChoiceQuestion,
  isRangeAnswer,
  isRangeQuestion,
  isTrueFalseAnswer,
  isTrueFalseQuestion,
  isTypeAnswerAnswer,
  isTypeAnswerQuestion,
} from './question.utils'
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
 * Determines if the provided answer is correct for the given question.
 *
 * @param {BaseQuestion & (QuestionMultiChoice | QuestionRange | QuestionTrueFalse | QuestionTypeAnswer)} question - The question object to check against.
 * @param {QuestionTaskBaseAnswer & (QuestionTaskMultiChoiceAnswer | QuestionTaskRangeAnswer | QuestionTaskTrueFalseAnswer | QuestionTaskTypeAnswerAnswer)} answer - The optional answer object to validate.
 *
 * @returns {boolean} Returns `true` if the answer is correct for the given question, otherwise `false`.
 */
function isQuestionAnswerCorrect(
  question: BaseQuestion &
    (
      | QuestionMultiChoice
      | QuestionRange
      | QuestionTrueFalse
      | QuestionTypeAnswer
    ),
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
    return question.correct === answer.answer
  }
  if (isTrueFalseQuestion(question) && isTrueFalseAnswer(answer)) {
    return question.correct === answer.answer
  }
  if (isTypeAnswerQuestion(question) && isTypeAnswerAnswer(answer)) {
    return question.correct.toLowerCase() === answer.answer.toLowerCase()
  }
  return false
}

/**
 * Calculates the player's score for Classic mode based on their response time.
 *
 * @param {Date} presented - The timestamp when the question was presented.
 * @param {Date} answered - The timestamp when the player submitted their answer.
 * @param {number} duration - The maximum time allowed to answer the question (in seconds).
 * @param {number} points - The maximum points for answering correctly.
 * @returns {number} The player's calculated score, rounded to the nearest whole number.
 *
 * @remarks
 * - The score decreases proportionally as the response time approaches the duration limit.
 * - If the response time exceeds the duration, the score is calculated as if the player answered at the last second.
 */
function calculateClassicModeScore(
  presented: Date,
  answered: Date,
  duration: number,
  points: number,
): number {
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
  const rawScore = points * scoreMultiplier

  // Step 5: Round to the nearest whole number
  return Math.round(rawScore)
}

/**
 * Calculates the player's score for ZeroToOneHundred mode.
 *
 * @param {number} correct - The correct answer for the question.
 * @param {number} [answer] - The player's submitted answer.
 * @returns {number} The score adjustment based on the proximity of the answer to the correct value.
 *
 * @remarks
 * - Returns a negative penalty (-10) for incorrect answers.
 * - Calculates the absolute difference for mismatched answers.
 */
function calculateZeroToOneHundredModeScore(correct: number, answer?: number) {
  if (correct !== answer) {
    return Math.abs(answer - correct)
  }
  return -10
}

/**
 * Constructs a new question result task based on the provided game document.
 *
 * @param {GameDocument} gameDocument - The current game document.
 *
 * @throws {IllegalTaskTypeException} If the current task type is not a question.
 *
 * @returns {BaseTask & QuestionResultTask} A new question result task object.
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

  const questionIndex = gameDocument.currentTask.questionIndex

  const question = gameDocument.questions[questionIndex]

  const results: QuestionResultTaskItem[] = gameDocument.players
    .map((player) => {
      const answer = gameDocument.currentTask.answers.find(
        ({ playerId }) => playerId === player._id,
      )

      const correct = isQuestionAnswerCorrect(question, answer)

      const presented = gameDocument.currentTask.presented

      const lastScore =
        gameDocument.mode === GameMode.Classic
          ? (correct &&
              answer !== undefined &&
              calculateClassicModeScore(
                presented,
                answer.created,
                question.duration,
                question.points,
              )) ||
            0
          : (answer !== undefined &&
              isRangeQuestion(question) &&
              isRangeAnswer(answer) &&
              calculateZeroToOneHundredModeScore(
                question.correct,
                answer.answer,
              )) ||
            100

      return {
        type: question.type,
        playerId: player._id,
        answer,
        correct,
        lastScore,
        totalScore: player.totalScore + lastScore,
        position: 0,
        streak: correct ? player.currentStreak + 1 : 0,
      }
    })
    .sort((a, b) =>
      gameDocument.mode === GameMode.Classic
        ? compareSortClassicModeQuestionResultTaskItemByScore(a, b)
        : compareZeroToOneHundredModeQuestionResultTaskItemByScore(a, b),
    )
    .map((item, index) => ({ ...item, position: index }))

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
 * @param {Player} lhs - The first player to compare.
 * @param {Player} rhs - The second player to compare.
 *
 * @returns {number} A positive value if `lhs` has a lower score, a negative value if higher, or 0 if they are equal.
 */
function compareSortClassicModePlayersByScore(
  lhs: Player,
  rhs: Player,
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
 * @param {Player} lhs - The first player to compare.
 * @param {Player} rhs - The second player to compare.
 *
 * @returns {number} A positive value if `lhs` has a higher score, a negative value if lower, or 0 if they are equal.
 *
 * @remarks
 * This reverses the sort order compared to Classic mode, sorting from lowest to highest.
 */
function compareZeroToOneHundredModePlayersByScore(
  lhs: Player,
  rhs: Player,
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
  return gameDocument.players
    .sort((a, b) =>
      gameDocument.mode === GameMode.Classic
        ? compareSortClassicModePlayersByScore(a, b)
        : compareZeroToOneHundredModePlayersByScore(a, b),
    )
    .map((player, index) => ({
      playerId: player._id,
      nickname: player.nickname,
      position: index + 1,
      score: player.totalScore,
      streaks: player.currentStreak,
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
  gameDocument.players.forEach((player) => {
    const resultEntry = gameDocument.currentTask.results.find(
      ({ playerId }) => playerId === player._id,
    )
    if (resultEntry) {
      player.totalScore = resultEntry.totalScore
      player.currentStreak = resultEntry.streak
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
