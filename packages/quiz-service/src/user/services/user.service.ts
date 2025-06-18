import { Injectable, NotImplementedException } from '@nestjs/common'
import { CreateUserRequestDto, CreateUserResponseDto } from '@quiz/common'

/**
 * Service responsible for creating and retrieving user accounts.
 */
@Injectable()
export class UserService {
  /**
   * Initializes the UserService.
   */
  constructor() {}

  /**
   * Creates and persists a new user record.
   *
   * @param requestDto Data for the new user (email, password, optional names).
   * @returns Created user data including timestamps.
   */
  public async createUser(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    requestDto: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    throw new NotImplementedException()
  }
}
