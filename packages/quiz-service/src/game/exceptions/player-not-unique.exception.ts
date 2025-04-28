import { ConflictException } from '@nestjs/common'

/**
 * Exception thrown when a player attempts to join a game more than once.
 *
 * This exception indicates that the player has already joined the game
 * and cannot participate as a duplicate.
 *
 * @extends {ConflictException}
 */
export class PlayerNotUniqueException extends ConflictException {
  constructor() {
    super('Player has already joined this game')
  }
}
