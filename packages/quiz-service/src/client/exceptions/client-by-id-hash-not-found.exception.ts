import { NotFoundException } from '@nestjs/common'

/**
 * Exception thrown when a client is not found by their hashed ID.
 */
export class ClientByIdHashNotFoundException extends NotFoundException {
  /**
   * Initializes the `ClientByIdHashNotFoundException`.
   *
   * @param {string} clientIdHash - The hashed ID of the client that was not found.
   */
  constructor(clientIdHash: string) {
    super(`Client was not found by hashed id '${clientIdHash}'`)
  }
}
