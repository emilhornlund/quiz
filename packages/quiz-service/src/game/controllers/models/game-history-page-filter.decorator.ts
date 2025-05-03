import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'

/**
 * Represents the query parameters used to filter and paginate game history results.
 */
export class GameHistoryPageFilter {
  /**
   * The maximum number of game history results to retrieve per page.
   */
  @ApiPropertyOptional({
    description:
      'The maximum number of game history results to retrieve per page.',
    type: Number,
    minimum: 5,
    maximum: 50,
    default: 5,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(50)
  @Type(() => Number)
  limit?: number

  /**
   * The number of game history results to skip before starting retrieval.
   */
  @ApiPropertyOptional({
    description:
      'The number of game history results to skip before starting retrieval.',
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
