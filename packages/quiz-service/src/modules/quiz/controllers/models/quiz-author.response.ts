import { QuizAuthorResponseDto } from '@quiz/common'

/**
 * Represents the response object for a quiz author.
 */
export class QuizAuthorResponse implements QuizAuthorResponseDto {
  /**
   * The unique identifier of the author.
   */
  id: string

  /**
   * The name of the author.
   */
  name: string
}
