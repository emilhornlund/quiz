import { NotFoundException } from '@nestjs/common'

/**
 * Exception thrown when a game with the given ID does not exist.
 */
export class GameNotFoundException extends NotFoundException {
  /**
   * Constructs a new GameNotFoundException.
   *
   * @param gameID - The ID of the game that was not found.
   */
  constructor(gameID: string) {
    super(`Game not found by id '${gameID}'`)
  }
}
