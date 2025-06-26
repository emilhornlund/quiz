import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Authority, TokenScope } from '@quiz/common'

import { ParseGamePINPipe } from '../../game/pipes'
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
    @Body() authLoginRequest: AuthLoginRequest,
  ): Promise<AuthLoginResponse> {
    return this.authService.login(authLoginRequest)
  }

  /**
   * Issue game‐scoped tokens by providing a game PIN.
   * If an Authorization header with a valid User token (and `Game` authority) is present,
   * that user ID is reused; otherwise a new anonymous participant is created.
   *
   * @param gamePIN - A 6-digit PIN that identifies the game.
   * @param authorization - Optional Bearer token of an authenticated user.
   * @returns A pair of access + refresh tokens scoped to the specified game.
   */
  @Public()
  @Post('/games/:gamePIN')
  @ApiOperation({
    summary: 'Game authentication',
    description: 'Issue JWTs for game participation using the game’s PIN.',
  })
  @ApiParam({
    name: 'gamePIN',
    type: String,
    description: 'The unique 6-digit PIN for the game to be retrieved.',
    required: true,
    example: '123456',
  })
  @ApiOkResponse({
    type: AuthLoginResponse,
    description: 'Game access and refresh tokens.',
  })
  @ApiBadRequestResponse({ description: 'Invalid game PIN format.' })
  @ApiNotFoundResponse({ description: 'No active game found with that PIN.' })
  @HttpCode(HttpStatus.OK)
  public async authenticateGame(
    @Param('gamePIN', new ParseGamePINPipe()) gamePIN: string,
    @Headers('Authorization') authorization?: string,
  ): Promise<AuthLoginResponse> {
    const optionalUserId =
      await this.extractUserIdFromAuthorizationHeader(authorization)
    return this.authService.authenticateGame(gamePIN, optionalUserId)
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
    description: 'Validation failed.',
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token is invalid/expired.',
  })
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Body() authRefreshRequest: AuthRefreshRequest,
  ): Promise<AuthLoginResponse> {
    return this.authService.refresh(authRefreshRequest)
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

  /**
   * If present, parses and validates a Bearer user‐token from the Authorization header.
   * Returns the user ID only if it has `TokenScope.User` and includes `Authority.Game`.
   *
   * @param authorization - The raw Authorization header (e.g. "Bearer eyJ...")
   * @returns The user ID to reuse as the game participant, or `undefined`.
   * @throws UnauthorizedException when the token is invalid or expired.
   * @private
   */
  private async extractUserIdFromAuthorizationHeader(
    authorization?: string,
  ): Promise<string | undefined> {
    if (!authorization) {
      return undefined
    }
    const [type, token] = authorization.split(' ') ?? []
    const accessToken = type === 'Bearer' ? token : undefined

    try {
      const payload = await this.authService.verifyToken(accessToken)
      if (
        payload.scope === TokenScope.User &&
        payload.authorities.includes(Authority.Game)
      ) {
        return payload.sub
      }
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
