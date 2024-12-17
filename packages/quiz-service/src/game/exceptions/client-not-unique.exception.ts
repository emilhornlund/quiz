import { ConflictException } from '@nestjs/common'

/**
 * Exception thrown when a client attempts to join a game more than once.
 *
 * This exception indicates that the client has already joined the game
 * and cannot participate as a duplicate.
 *
 * @extends {ConflictException}
 */
export class ClientNotUniqueException extends ConflictException {
  constructor() {
    super('Client has already joined this game')
  }
}
