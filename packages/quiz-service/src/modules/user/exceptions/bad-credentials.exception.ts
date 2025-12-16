import { BadRequestException } from '@nestjs/common'

/**
 * Thrown when the email or password is incorrect (HTTP 400).
 *
 * @extends {BadRequestException}
 */
export class BadCredentialsException extends BadRequestException {
  constructor() {
    super('Bad credentials')
  }
}
