import { ForbiddenException } from '@nestjs/common'

/**
 * Exception thrown when a player attempts to join a game that has reached the
 * maximum allowed number of player participants.
 *
 * Extends `ForbiddenException` and returns a static message: `Game is full`.
 */
export class GameFullException extends ForbiddenException {
  constructor() {
    super('Game is full')
  }
}
