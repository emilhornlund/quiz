import { NotFoundException } from '@nestjs/common'

/**
 * Exception thrown when a quiz rating is not found by its unique identifier.
 */
export class QuizRatingNotFoundException extends NotFoundException {
  /**
   * Initializes the `QuizRatingNotFoundException`.
   *
   * @param quizRatingId - The unique identifier of the quiz rating that was not found.
   */
  constructor(quizRatingId: string) {
    super(`Quiz rating was not found by id '${quizRatingId}'`)
  }
}

/**
 * Exception thrown when a quiz rating is not found for a given quiz and author.
 *
 * This is typically used when retrieving a user's rating for a quiz.
 */
export class QuizRatingByQuizAndAuthorNotFoundException extends NotFoundException {
  /**
   * Initializes the `QuizRatingByQuizAndAuthorNotFoundException`.
   *
   * @param quizId - The unique identifier of the quiz.
   * @param authorId - The unique identifier of the author (user).
   */
  constructor(quizId: string, authorId: string) {
    super(
      `Quiz rating was not found by quiz id '${quizId}' and author id '${authorId}'`,
    )
  }
}
