import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { Public } from '../../auth/controllers/decorators'
import { UserService } from '../services'

import { CreateUserRequest, CreateUserResponse } from './models'

/**
 * Controller for user management endpoints.
 */
@ApiBearerAuth()
@ApiTags('user')
@Controller('users')
export class UserController {
  /**
   * Initializes the UserController.
   *
   * @param userService Service for user operations.
   */
  constructor(private readonly userService: UserService) {}

  /**
   * Creates a new user account.
   *
   * @param createUserRequest DTO containing email, password, and optional names.
   * @returns The newly created user’s details.
   */
  @Public()
  @Post()
  @ApiOperation({
    summary: 'Create new user',
    description:
      'Registers a new user with email, password, and optional names.',
  })
  @ApiBody({
    description: 'Payload for creating a new user.',
    type: CreateUserRequest,
  })
  @ApiOkResponse({
    description: 'User successfully created.',
    type: CreateUserResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input.',
  })
  @ApiConflictResponse({
    description: 'User already exists.',
  })
  @HttpCode(HttpStatus.CREATED)
  public async createUser(
    @Body() createUserRequest: CreateUserRequest,
  ): Promise<CreateUserResponse> {
    return this.userService.createUser(createUserRequest)
  }
}
