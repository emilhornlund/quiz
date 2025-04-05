import { GameDocument, TaskType } from '../models/schemas'

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
