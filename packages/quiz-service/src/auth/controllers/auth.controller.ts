import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { Public } from '../decorators'
import { AuthService } from '../services'

import { AuthRequest, AuthResponse } from './models'

/**
 * Controller for managing authentication.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  /**
   * Initializes the AuthController.
   *
   * @param {AuthService} authService - The service handling authentication logic.
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Authenticates a client and returns a JWT token.
   *
   * @param {AuthRequest} authRequest - The client authentication request.
   *
   * @returns {Promise<AuthResponse>} The authentication response containing a token.
   */
  @Public()
  @Post()
  @ApiOperation({
    summary: 'Authenticate a client',
    description:
      'Generates a JWT token for a client identified by a unique client ID.',
  })
  @ApiBody({
    description: 'Client ID for authentication',
    type: AuthRequest,
  })
  @ApiOkResponse({
    description: 'Client successfully authenticated',
    type: AuthResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid client ID or validation failure',
  })
  @HttpCode(HttpStatus.OK)
  public async authenticate(
    @Body()
    authRequest: AuthRequest,
  ): Promise<AuthResponse> {
    return this.authService.authenticate(authRequest)
  }
}
