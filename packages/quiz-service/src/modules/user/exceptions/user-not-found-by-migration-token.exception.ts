import { NotFoundException } from '@nestjs/common'

/**
 * Thrown when the user was not found by its migration token (HTTP 404).
 *
 * @extends {NotFoundException}
 */
export class UserNotFoundByMigrationTokenException extends NotFoundException {
  constructor() {
    super('User was not found by migration token')
  }
}
