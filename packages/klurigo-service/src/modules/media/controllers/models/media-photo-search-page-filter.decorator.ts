import {
  MEDIA_SEARCH_TERM_MAX_LENGTH,
  MEDIA_SEARCH_TERM_MIN_LENGTH,
  MEDIA_SEARCH_TERM_REGEX,
} from '@klurigo/common'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
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
 * Represents the query parameters used to filter and paginate photos.
 */
export class MediaPhotoSearchPageFilter {
  /**
   * A search term to filter photos by name or tags.
   */
  @ApiPropertyOptional({
    name: 'search',
    description: 'A search term to filter photos by name or tags.',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  @MinLength(MEDIA_SEARCH_TERM_MIN_LENGTH, {
    message: `Search term must be longer than or equal to ${MEDIA_SEARCH_TERM_MIN_LENGTH} characters.`,
  })
  @MaxLength(MEDIA_SEARCH_TERM_MAX_LENGTH, {
    message: `Search term must be shorter than or equal to ${MEDIA_SEARCH_TERM_MAX_LENGTH} characters.`,
  })
  @Matches(MEDIA_SEARCH_TERM_REGEX, {
    message:
      'Search term can only contain letters, numbers, underscores and spaces',
  })
  search?: string

  /**
   * The maximum number of photos to retrieve per page.
   */
  @ApiPropertyOptional({
    description: 'The maximum number of photos to retrieve per page.',
    type: Number,
    minimum: 5,
    maximum: 50,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(50)
  @Type(() => Number)
  limit?: number

  /**
   * The number of photos to skip before starting retrieval.
   */
  @ApiPropertyOptional({
    description: 'The number of photos to skip before starting retrieval.',
    type: Number,
    minimum: 0,
    default: 0,
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number
}
