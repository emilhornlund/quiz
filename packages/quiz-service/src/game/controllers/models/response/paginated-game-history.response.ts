import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { PaginatedGameHistoryDto } from '@quiz/common'
import { IsArray, IsNumber, Max, Min } from 'class-validator'

import { GameHistoryHostResponse } from './game-history-host.response'
import { GameHistoryPlayerResponse } from './game-history-player.response'

/**
 * Represents a paginated response for game history, including metadata such as total, limit, and offset.
 */
@ApiExtraModels(GameHistoryHostResponse, GameHistoryPlayerResponse)
export class PaginatedGameHistoryResponse implements PaginatedGameHistoryDto {
  /**
   * The list of game history results for the current page.
   */
  @ApiProperty({
    description: 'The list of game history results for the current page.',
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(GameHistoryHostResponse) },
        { $ref: getSchemaPath(GameHistoryPlayerResponse) },
      ],
    },
    required: true,
  })
  @IsArray()
  results: (GameHistoryHostResponse | GameHistoryPlayerResponse)[]

  /**
   * The total number of game history results available.
   */
  @ApiProperty({
    description: 'The total number of game history results available.',
    type: Number,
    minimum: 0,
    required: true,
    example: 10,
  })
  @IsNumber()
  @Min(0)
  total: number

  /**
   * The maximum number of game history results returned per page.
   */
  @ApiProperty({
    description:
      'The maximum number of game history results returned per page.',
    type: Number,
    required: true,
    minimum: 0,
    maximum: 50,
    example: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(50)
  limit: number

  /**
   * The offset from the start of the total game history results.
   */
  @ApiProperty({
    description: 'The offset from the start of the total game history results.',
    type: Number,
    minimum: 0,
    required: true,
    example: 0,
  })
  @IsNumber()
  @Min(0)
  offset: number
}
