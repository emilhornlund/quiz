import { NotFoundException } from '@nestjs/common'

/**
 * Thrown when the user was not found by its unique identifier (HTTP 404).
 *
 * @extends {NotFoundException}
 */
export class UserNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`User '${id}' was not found`)
  }
}
