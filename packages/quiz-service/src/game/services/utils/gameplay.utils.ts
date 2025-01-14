import { Redis } from 'ioredis'

import { IllegalTaskTypeException } from '../../exceptions'
import { GameDocument, QuestionTaskAnswer, TaskType } from '../models/schemas'

import { getRedisPlayerParticipantAnswerKey } from './game-redis.utils'
import { toQuestionTaskAnswerFromString } from './question-answer.utils'
import {
  buildLeaderboardTask,
  buildPodiumTask,
  buildQuestionResultTask,
  buildQuestionTask,
  buildQuitTask,
} from './task.converter'

/**
 * Callback for completing the Lobby task.
 *
 * This function transitions the current task from 'Lobby' to the next task, which is
 * typically the first question task. It moves the current task to the `previousTasks` array
 * and updates `currentTask` with a newly created question task.
 *
 * @param {GameDocument} gameDocument - The game document containing the current task.
 */
export async function lobbyTaskCompletedCallback(
  gameDocument: GameDocument,
): Promise<void> {
  if (gameDocument.currentTask.type !== TaskType.Lobby) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.Lobby,
    )
  }
  gameDocument.previousTasks.push(gameDocument.currentTask)
  gameDocument.currentTask = buildQuestionTask(gameDocument)
  gameDocument.nextQuestion = gameDocument.nextQuestion + 1
}

/**
 * Callback for completing the current question task.
 *
 * This function transitions the current task from a question task to the next task.
 * It moves the current question task to the `previousTasks` array and updates `currentTask`
 * with a newly created question result task.
 *
 * @param {GameDocument} gameDocument - The game document containing the current task.
 * @param {Redis} redis - The Redis instance used for managing data synchronization and storing answers.
 */
export async function questionTaskCompletedCallback(
  gameDocument: GameDocument,
  redis: Redis,
): Promise<void> {
  if (gameDocument.currentTask.type !== TaskType.Question) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.Question,
    )
  }

  const answers: QuestionTaskAnswer[] = (
    await redis.lrange(
      getRedisPlayerParticipantAnswerKey(gameDocument._id),
      0,
      -1,
    )
  ).map(toQuestionTaskAnswerFromString)

  await redis.del(getRedisPlayerParticipantAnswerKey(gameDocument._id))

  gameDocument.currentTask.answers = answers
  gameDocument.previousTasks.push(gameDocument.currentTask)
  gameDocument.currentTask = buildQuestionResultTask(gameDocument, answers)
}

const AVERAGE_WPM = 220 // Average reading speed in words per minute
const MILLISECONDS_PER_MINUTE = 60000
const RATIO = 100 // Fallback character-based ratio (milliseconds per character)
const MAX_CHARACTER_DURATION = 15000 // Maximum fallback duration in milliseconds

/**
 * Calculates the pending duration for reading the current question text in milliseconds.
 *
 * @param gameDocument - The game document containing the current task and questions.
 *
 * @returns {number} The pending duration in milliseconds.
 *
 * @throws {Error} If the current task type is not 'Question' or the question index is invalid.
 */
export function getQuestionTaskPendingDuration(
  gameDocument: GameDocument,
): number {
  if (gameDocument.currentTask.type !== TaskType.Question) {
    throw new Error('Illegal task type')
  }

  const questionIndex = gameDocument.currentTask.questionIndex
  if (questionIndex < 0 || questionIndex >= gameDocument.questions.length) {
    throw new Error('Invalid question index')
  }

  const questionText = gameDocument.questions[questionIndex].text

  const wordCount = questionText.trim().split(/\s+/).length
  const readingDuration = (wordCount / AVERAGE_WPM) * MILLISECONDS_PER_MINUTE

  const characterDuration = Math.min(
    questionText.length * RATIO,
    MAX_CHARACTER_DURATION,
  )

  return Math.max(readingDuration, characterDuration)
}

/**
 * Sets the `presented` timestamp for a question task during its pending state.
 *
 * @param {GameDocument} gameDocument - The game document containing the current task.
 * @throws {IllegalTaskTypeException} If the current task type is not a question.
 */
export async function getQuestionTaskPendingCallback(
  gameDocument: GameDocument,
): Promise<void> {
  if (gameDocument.currentTask.type !== TaskType.Question) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.QuestionResult,
    )
  }
  gameDocument.currentTask.presented = new Date()
}

/**
 * Retrieves the active duration for the current question task in milliseconds.
 *
 * @param gameDocument - The game document containing the current task and questions.
 *
 * @returns {number} The active duration in milliseconds.
 *
 * @throws {Error} If the current task type is not 'Question' or the question index is invalid.
 */
export function getQuestionTaskActiveDuration(
  gameDocument: GameDocument,
): number {
  if (gameDocument.currentTask.type !== TaskType.Question) {
    throw new Error('Illegal task type')
  }

  const questionIndex = gameDocument.currentTask.questionIndex
  if (questionIndex < 0 || questionIndex >= gameDocument.questions.length) {
    throw new Error('Invalid question index')
  }

  const durationInSeconds = gameDocument.questions[questionIndex].duration
  return durationInSeconds * 1000
}

/**
 * Callback for completing the current question result task.
 *
 * This function transitions the current task from a question result task to the next task.
 * It moves the current question task to the `previousTasks` array and updates `currentTask`
 * with an either newly created leaderboard or a podium task.
 *
 * @param {GameDocument} gameDocument - The game document containing the current task.
 */
export async function questionResultTaskCompletedCallback(
  gameDocument: GameDocument,
): Promise<void> {
  if (gameDocument.currentTask.type !== TaskType.QuestionResult) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.QuestionResult,
    )
  }

  gameDocument.previousTasks.push(gameDocument.currentTask)

  if (gameDocument.nextQuestion < gameDocument.questions.length) {
    gameDocument.currentTask = buildLeaderboardTask(gameDocument)
  } else {
    gameDocument.currentTask = buildPodiumTask(gameDocument)
  }
}

/**
 * Callback for completing the current leaderboard task.
 *
 * This function transitions the current task from a leaderboard task to the next task.
 * It moves the current question task to the `previousTasks` array and updates `currentTask`
 * with a newly created question task.
 *
 * @param {GameDocument} gameDocument - The game document containing the current task.
 */
export async function leaderboardTaskCompletedCallback(
  gameDocument: GameDocument,
): Promise<void> {
  if (gameDocument.currentTask.type !== TaskType.Leaderboard) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.Leaderboard,
    )
  }

  gameDocument.previousTasks.push(gameDocument.currentTask)
  gameDocument.currentTask = buildQuestionTask(gameDocument)
  gameDocument.nextQuestion = gameDocument.nextQuestion + 1
}

/**
 * Handles the completion of the podium task by transitioning it to the quit task.
 *
 * @param {GameDocument} gameDocument - The game document containing the current task.
 *
 * @throws {IllegalTaskTypeException} If the current task type is not `Podium`.
 */
export async function podiumTaskCompletedCallback(
  gameDocument: GameDocument,
): Promise<void> {
  if (gameDocument.currentTask.type !== TaskType.Podium) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.Podium,
    )
  }

  gameDocument.previousTasks.push(gameDocument.currentTask)
  gameDocument.currentTask = buildQuitTask()
}
