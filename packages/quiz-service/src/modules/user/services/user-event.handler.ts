import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import { UserLoginEvent } from '../../../auth/services/models'
import { USER_LOGIN_EVENT_KEY } from '../../../auth/services/utils'
import { UserRepository } from '../repositories'

/**
 * Handles domain events related to users.
 *
 * Currently listens for the UserLoginEvent to update each user's last-logged-in timestamp.
 */
@Injectable()
export class UserEventHandler {
  // Logger instance for recording event handler operations.
  private readonly logger: Logger = new Logger(UserEventHandler.name)

  /**
   * Initializes the UserEventHandler.
   *
   * @param userRepository  - Repository for user data access.
   */
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Handles a UserLoginEvent by updating the corresponding user’s `lastLoggedInAt` field.
   *
   * @param event  - The UserLoginEvent containing the user's ID and the login timestamp.
   */
  @OnEvent(USER_LOGIN_EVENT_KEY)
  public async handleUserLoginEvent(event: UserLoginEvent) {
    this.logger.debug(
      `Handling 'UserLoginEvent' for user with id '${event.userId}'.`,
    )

    try {
      await this.userRepository.findUserByIdAndUpdateOrThrow(event.userId, {
        lastLoggedInAt: event.date,
      })
    } catch (error) {
      const { message, stack } = error as Error
      this.logger.error(
        `Failed to update user '${event.userId}' with last login timestamp: '${message}'.`,
        stack,
      )
    }
  }
}
