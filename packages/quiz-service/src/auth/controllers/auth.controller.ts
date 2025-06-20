import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Post,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { AuthService } from '../services'

import { Public } from './decorators'
import {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthRefreshRequest,
  LegacyAuthRequest,
  LegacyAuthResponse,
} from './models'

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
   * Authenticates a user by verifying their email and password,
   * then issues a new access token and refresh token.
   *
   * @param authLoginRequest - Request containing the user's email and password.
   * @returns Promise resolving to an AuthLoginResponse with both tokens.
   */
  @Public()
  @Post('/login')
  @ApiOperation({
    summary: 'Authenticate with email and password',
    description:
      'Verifies user credentials and issues a new access token and refresh token.',
  })
  @ApiBody({
    description: 'Payload containing the user’s email and password.',
    type: AuthLoginRequest,
  })
  @ApiOkResponse({
    description: 'Returns the issued access and refresh tokens.',
    type: AuthLoginResponse,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or credentials are incorrect.',
  })
  @HttpCode(HttpStatus.OK)
  public async login(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() authLoginRequest: AuthLoginRequest,
  ): Promise<AuthLoginResponse> {
    throw new NotImplementedException()
  }

  /**
   * Validates the provided refresh token and issues a new access token
   * (and rotates the refresh token if applicable).
   *
   * @param authRefreshRequest - Request containing the existing refresh token.
   * @returns Promise resolving to an AuthLoginResponse with new tokens.
   */
  @Public()
  @Post('/refresh')
  @ApiOperation({
    summary: 'Refresh access token using a refresh token',
    description:
      'Validates the provided refresh token and issues a new access token (and optionally a new refresh token).',
  })
  @ApiBody({
    description: 'Payload containing the existing refresh token.',
    type: AuthRefreshRequest,
  })
  @ApiOkResponse({
    description:
      'Returns a new access token and, if rotated, a new refresh token.',
    type: AuthLoginResponse,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or refresh token is invalid/expired.',
  })
  @HttpCode(HttpStatus.OK)
  public async refresh(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() authRefreshRequest: AuthRefreshRequest,
  ): Promise<AuthLoginResponse> {
    throw new NotImplementedException()
  }

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
    return this.authService.legacyAuthenticate(authRequest)
  }
}
