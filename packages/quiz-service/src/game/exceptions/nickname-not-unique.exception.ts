import { ConflictException } from '@nestjs/common'

/**
 * Exception thrown when a player's nickname is not unique in a game.
 *
 * This exception indicates that the provided nickname is already
 * in use by another player within the same game.
 *
 * @extends {ConflictException}
 */
export class NicknameNotUniqueException extends ConflictException {
  constructor(nickname: string) {
    super(`Nickname "${nickname}" is already taken in this game`)
  }
}
