import { NotFoundException } from '@nestjs/common'

/**
 * Exception thrown when a player is not found by their ID.
 */
export class PlayerNotFoundException extends NotFoundException {
  /**
   * Initializes the `PlayerNotFoundException`.
   *
   * @param {string} playerId - The unique identifier of the player that was not found.
   */
  constructor(playerId: string) {
    super(`Player was not found by id '${playerId}'`)
  }
}
