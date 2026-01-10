/**
 * DTO representing the author of a quiz rating.
 *
 * Used to expose a minimal subset of user/profile information in rating responses.
 */
export type QuizRatingAuthorDto = {
  /**
   * The unique identifier of the author.
   */
  readonly id: string

  /**
   * The displayed nickname of the author at the time of retrieval.
   */
  readonly nickname: string
}

/**
 * DTO representing a single quiz rating and optional feedback comment.
 *
 * Each rating is associated with a quiz and an author, and contains a star value (1–5).
 */
export type QuizRatingDto = {
  /**
   * The unique identifier of the quiz rating.
   */
  readonly id: string

  /**
   * The unique identifier of the quiz being rated.
   */
  readonly quizId: string

  /**
   * Star rating for the quiz.
   *
   * Must be a number between 1 and 5 (inclusive).
   */
  readonly stars: number

  /**
   * Optional free-text feedback comment for the quiz.
   */
  readonly comment?: string

  /**
   * The author of the rating.
   */
  readonly author: QuizRatingAuthorDto

  /**
   * The date and time when the rating was created.
   */
  readonly createdAt: Date

  /**
   * The date and time when the rating was last updated.
   */
  readonly updatedAt: Date
}

/**
 * DTO representing a paginated list of quiz ratings.
 */
export type PaginatedQuizRatingDto = {
  /**
   * The paginated rating results.
   */
  readonly results: QuizRatingDto[]

  /**
   * The total number of rating documents matching the query.
   */
  readonly total: number

  /**
   * The maximum number of results returned.
   */
  readonly limit: number

  /**
   * The number of results skipped before returning `results`.
   */
  readonly offset: number
}
