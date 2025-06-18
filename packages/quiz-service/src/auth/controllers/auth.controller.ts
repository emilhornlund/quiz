import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { AuthService } from '../services'

import { Public } from './decorators'
import { LegacyAuthRequest, LegacyAuthResponse } from './models'

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
   * @param {LegacyAuthRequest} authRequest - The client authentication request.
   *
   * @returns {Promise<LegacyAuthResponse>} The authentication response containing a token.
   */
  @Public()
  @Post()
  @ApiOperation({
    summary: 'Authenticate a client',
    description:
      'Generates a JWT token for a client identified by a unique client ID.',
    deprecated: true,
  })
  @ApiBody({
    description: 'Client ID for authentication',
    type: LegacyAuthRequest,
  })
  @ApiOkResponse({
    description: 'Client successfully authenticated',
    type: LegacyAuthResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid client ID or validation failure',
  })
  @HttpCode(HttpStatus.OK)
  public async authenticate(
    @Body()
    authRequest: LegacyAuthRequest,
  ): Promise<LegacyAuthResponse> {
    return this.authService.authenticate(authRequest)
  }
}
