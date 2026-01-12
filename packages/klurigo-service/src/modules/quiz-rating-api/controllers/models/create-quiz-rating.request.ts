import {
  CreateQuizRatingDto,
  QUIZ_RATING_COMMENT_MAX_LENGTH,
  QUIZ_RATING_COMMENT_MIN_LENGTH,
  QUIZ_RATING_COMMENT_REGEX,
  QUIZ_RATING_STARS_MAX,
  QUIZ_RATING_STARS_MIN,
} from '@klurigo/common'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

/**
 * API request model for creating a quiz rating.
 *
 * Used by a participant to submit a star rating (and optionally a short comment) for a quiz.
 */
export class CreateQuizRatingRequest implements CreateQuizRatingDto {
  /**
   * The star rating value (1–5).
   */
  @ApiProperty({
    title: 'Stars',
    description: 'The star rating value (1–5).',
    required: true,
    type: Number,
    example: QUIZ_RATING_STARS_MAX,
    minimum: QUIZ_RATING_STARS_MIN,
    maximum: QUIZ_RATING_STARS_MAX,
  })
  @IsInt()
  @Min(QUIZ_RATING_STARS_MIN)
  @Max(QUIZ_RATING_STARS_MAX)
  readonly stars: number

  /**
   * Optional free-text feedback comment for the quiz.
   *
   * Limited to 255 characters.
   */
  @ApiPropertyOptional({
    title: 'Comment',
    description: 'Optional free-text feedback comment for the quiz.',
    required: false,
    type: String,
    example: 'Great quiz—good pacing and fun questions.',
    minLength: QUIZ_RATING_COMMENT_MIN_LENGTH,
    maxLength: QUIZ_RATING_COMMENT_MAX_LENGTH,
    pattern: QUIZ_RATING_COMMENT_REGEX.source,
  })
  @IsOptional()
  @IsString()
  @MinLength(QUIZ_RATING_COMMENT_MIN_LENGTH)
  @MaxLength(QUIZ_RATING_COMMENT_MAX_LENGTH)
  @Matches(QUIZ_RATING_COMMENT_REGEX, {
    message: 'Comment must not be blank.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  readonly comment?: string
}
