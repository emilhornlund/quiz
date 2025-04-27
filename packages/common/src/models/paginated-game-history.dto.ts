import { GameHistoryDto } from './game-history.dto'

/**
 * Represents a paginated response containing a user's previous games.
 */
export interface PaginatedGameHistoryDto {
  /**
   * The list of games for the current page.
   */
  results: GameHistoryDto[]

  /**
   * The total number of games available for the user.
   */
  total: number

  /**
   * The maximum number of games returned per page.
   */
  limit: number

  /**
   * The number of games skipped before the current page (used for pagination).
   */
  offset: number
}
