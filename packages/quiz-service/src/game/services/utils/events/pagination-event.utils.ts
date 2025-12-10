import { PaginationEvent } from '@quiz/common'

import {
  GameDocument,
  QuestionResultTaskWithBase,
} from '../../../repositories/models/schemas'

/**
 * Builds a pagination event from the current task's question index.
 *
 * Assumes the current task stores a zero-based `questionIndex` and converts it
 * to a one-based index for the pagination event.
 *
 * @param gameDocument - Game document whose current task exposes `questionIndex`.
 * @returns Pagination metadata with current question (1-based) and total questions.
 */
export function buildPaginationEventFromGameDocument(
  gameDocument: GameDocument & { currentTask: { questionIndex: number } },
): PaginationEvent {
  return buildPaginationEvent(
    gameDocument.currentTask.questionIndex + 1,
    gameDocument.questions.length,
  )
}

/**
 * Builds a pagination event for a specific question result task.
 *
 * Uses the task's zero-based `questionIndex` and converts it to a one-based
 * index for the pagination event.
 *
 * @param gameDocument - Game document containing all questions.
 * @param questionResultTask - Question result task with the current `questionIndex`.
 * @returns Pagination metadata with current question (1-based) and total questions.
 */
export function buildPaginationEventFromQuestionResultTask(
  gameDocument: GameDocument,
  questionResultTask: QuestionResultTaskWithBase,
): PaginationEvent {
  return buildPaginationEvent(
    questionResultTask.questionIndex + 1,
    gameDocument.questions.length,
  )
}

/**
 * Builds a pagination event from explicit values.
 *
 * @param currentQuestion - One-based index of the current question.
 * @param totalQuestions - Total number of questions in the game.
 * @returns Pagination metadata with current and total.
 */
export function buildPaginationEvent(
  currentQuestion: number,
  totalQuestions: number,
): PaginationEvent {
  return {
    current: currentQuestion,
    total: totalQuestions,
  }
}
