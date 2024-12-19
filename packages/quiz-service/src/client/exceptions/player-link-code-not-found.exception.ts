import { NotFoundException } from '@nestjs/common'

/**
 * Exception thrown when a player link code is not found.
 */
export class PlayerLinkCodeNotFoundException extends NotFoundException {
  /**
   * Initializes the `PlayerLinkCodeNotFoundException`.
   */
  constructor() {
    super('Player link code was not found')
  }
}
