import { NotFoundException } from '@nestjs/common'

/**
 * Exception thrown when game results are not available for the given game ID.
 */
export class GameResultsNotFoundException extends NotFoundException {
  /**
   * Constructs a new GameResultsNotFoundException.
   *
   * @param gameID - The ID of the game whose results were not found.
   */
  constructor(gameID: string) {
    super(`Game results not found by game id '${gameID}'`)
  }
}
