import { ConflictException } from '@nestjs/common'

/**
 * Thrown when the email is already in use (HTTP 409).
 *
 * @extends {ConflictException}
 */
export class EmailNotUniqueException extends ConflictException {
  constructor(email: string) {
    super(`Email '${email}' is not unique`)
  }
}
