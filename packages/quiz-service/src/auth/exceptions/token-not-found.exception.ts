import { NotFoundException } from '@nestjs/common'

/**
 * Thrown when the token was not found by its unique identifier (HTTP 404).
 *
 * @extends {NotFoundException}
 */
export class TokenNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Token with id '${id}' was not found`)
  }
}
