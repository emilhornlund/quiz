import { NotFoundException } from '@nestjs/common'

/**
 * Exception thrown when a Quiz is not found by its ID.
 */
export class QuizNotFoundException extends NotFoundException {
  /**
   * Initializes the `QuizNotFoundException`.
   *
   * @param {string} quizId - The unique identifier of the quiz that was not found.
   */
  constructor(quizId: string) {
    super(`Quiz was not found by id '${quizId}'`)
  }
}
