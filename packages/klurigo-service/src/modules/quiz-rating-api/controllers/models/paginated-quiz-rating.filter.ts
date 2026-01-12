import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator'

/**
 * Parses common boolean-like query parameter values into actual booleans.
 *
 * Converts typical query string representations into `true` or `false`
 * while deliberately leaving unsupported values untouched so that
 * downstream validation can fail explicitly.
 *
 * Supports:
 * - `true` / `false` as booleans
 * - `1` / `0` as numbers
 * - `"true"` / `"false"` / `"1"` / `"0"` as strings (case-insensitive, trimmed)
 *
 * @param value - The raw query parameter value to parse.
 *
 * @returns `true` or `false` when the input represents a boolean value;
 * otherwise returns the original value unchanged to allow validation
 * decorators (for example `@IsBoolean`) to report an error.
 */
function parseQueryBoolean(value: unknown): unknown {
  if (typeof value === 'boolean') return value

  if (typeof value === 'number') {
    if (value === 1) return true
    if (value === 0) return false
    return value
  }

  if (typeof value === 'string') {
    const v = value.trim().toLowerCase()
    if (v === 'true' || v === '1') return true
    if (v === 'false' || v === '0') return false
  }

  // Leave as-is so @IsBoolean can fail for invalid inputs
  return value
}

/**
 * Request query parameters for fetching quiz ratings with pagination and sorting.
 *
 * Used by endpoints that return a paginated list of ratings for a quiz.
 */
export class PaginatedQuizRatingFilter {
  /**
   * The field by which to sort the results.
   */
  @ApiPropertyOptional({
    name: 'sort',
    description: 'The field by which to sort the results.',
    enum: ['created', 'updated'],
    required: false,
    default: 'updated',
    example: 'updated',
  })
  @IsOptional()
  @IsIn(['created', 'updated'], {
    message: 'sort must be one of the following values: created, updated',
  })
  sort?: 'created' | 'updated'

  /**
   * The sort order for the results.
   */
  @ApiPropertyOptional({
    name: 'order',
    description: 'The sort order for the results.',
    enum: ['asc', 'desc'],
    required: false,
    default: 'asc',
    example: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'order must be one of the following values: asc, desc',
  })
  order?: 'asc' | 'desc'

  /**
   * The maximum number of quiz ratings to retrieve per page.
   */
  @ApiPropertyOptional({
    name: 'limit',
    description: 'The maximum number of quiz ratings to retrieve per page.',
    type: Number,
    required: false,
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
   * The number of quiz ratings to skip before starting retrieval.
   */
  @ApiPropertyOptional({
    name: 'offset',
    description:
      'The number of quiz ratings to skip before starting retrieval.',
    type: Number,
    required: false,
    minimum: 0,
    default: 0,
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number

  /**
   * Whether to only include quiz ratings that contain a non-empty comment.
   */
  @ApiPropertyOptional({
    name: 'commentsOnly',
    description:
      'Whether to only include quiz ratings that contain a non-empty comment.',
    type: Boolean,
    required: false,
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => parseQueryBoolean(value))
  commentsOnly?: boolean
}
