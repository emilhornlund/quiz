import { QuizRatingAuthorDto } from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'

/**
 * API response model representing the author of a quiz rating.
 */
export class QuizRatingAuthorResponse implements QuizRatingAuthorDto {
  /**
   * The unique identifier of the author (the authenticated client/profile ID).
   */
  @ApiProperty({
    title: 'ID',
    description:
      'The unique identifier of the author (the authenticated client/profile ID).',
    required: true,
    type: String,
    format: 'uuid',
    example: '6586e421-3ed2-4f6b-b29c-60bdb8ded727',
  })
  readonly id: string

  /**
   * The nickname displayed for the author at the time the rating was created.
   */
  @ApiProperty({
    title: 'Nickname',
    description:
      'The nickname displayed for the author at the time the rating was created.',
    required: true,
    type: String,
    example: 'Emil',
  })
  readonly nickname: string
}
