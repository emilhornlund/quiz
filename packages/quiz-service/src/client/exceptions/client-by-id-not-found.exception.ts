import { NotFoundException } from '@nestjs/common'

/**
 * Exception thrown when a client is not found by their ID.
 */
export class ClientByIdNotFoundException extends NotFoundException {
  /**
   * Initializes the `ClientByIdNotFoundException`.
   *
   * @param {string} clientId - The ID of the client that was not found.
   */
  constructor(clientId: string) {
    super(`Client was not found by id '${clientId}'`)
  }
}
