import { NotFoundException } from '@nestjs/common'

/**
 * Exception thrown when a Question is not found by its ID.
 */
export class QuestionNotFoundException extends NotFoundException {
  /**
   * Initializes the `QuestionNotFoundException`.
   *
   * @param {string} questionId - The unique identifier of the question that was not found.
   */
  constructor(questionId: string) {
    super(`Question was not found by id '${questionId}'`)
  }
}
