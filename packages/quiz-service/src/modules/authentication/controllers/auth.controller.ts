import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Authority, TokenScope } from '@quiz/common'

import { TokenService } from '../../token/services'
import { UserService } from '../../user/services'
import { AuthService } from '../services'

import { IpAddress, PrincipalId, Public, UserAgent } from './decorators'
import {
  AuthGameRequest,
  AuthGoogleExchangeRequest,
  AuthLoginRequest,
  AuthPasswordChangeRequest,
  AuthRefreshRequest,
  AuthResponse,
  AuthRevokeRequest,
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
   * @param authService - Service handling authentication flows such as login, refresh, and game authentication.
   * @param tokenService - Service responsible for token verification and token revocation.
   * @param userService - Service providing user profile and account operations used by auth endpoints.
   */
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  /**
   * Authenticates a user by verifying their email and password,
   * then issues a new access token and refresh token.
   *
   * @param authLoginRequest - Request containing the user's email and password.
   * @param ipAddress - The client's IP address, extracted via the `@IpAddress()` decorator.
   * @param userAgent - The client's User-Agent header, extracted via the `@UserAgent()` decorator.
   * @returns Promise resolving to an AuthResponse with both tokens.
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
    type: AuthResponse,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or credentials are incorrect.',
  })
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() authLoginRequest: AuthLoginRequest,
    @IpAddress() ipAddress: string,
    @UserAgent() userAgent: string,
  ): Promise<AuthResponse> {
    return this.authService.login(authLoginRequest, ipAddress, userAgent)
  }

  /**
   * Exchanges a Google OAuth authorization code and PKCE verifier
   * for an authentication response containing access and refresh tokens.
   *
   * @param request   - Request containing the Google OAuth `code` and `codeVerifier`.
   * @param ipAddress - The client's IP address, extracted via the `@IpAddress()` decorator.
   * @param userAgent - The client's User-Agent header, extracted via the `@UserAgent()` decorator.
   * @returns Promise resolving to an AuthResponse with both tokens.
   */
  @Public()
  @Post('/google/exchange')
  @ApiBody({
    description:
      'Request payload with Google OAuth authorization code and PKCE code verifier.',
    type: AuthGoogleExchangeRequest,
  })
  @ApiOkResponse({
    description:
      'Successfully exchanged code; returns access and refresh tokens.',
    type: AuthResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid code, code verifier, or PKCE validation failed.',
  })
  @HttpCode(HttpStatus.OK)
  public async googleCodeExchange(
    @Body() request: AuthGoogleExchangeRequest,
    @IpAddress() ipAddress: string,
    @UserAgent() userAgent: string,
  ): Promise<AuthResponse> {
    return this.authService.loginGoogle(
      request.code,
      request.codeVerifier,
      ipAddress,
      userAgent,
    )
  }

  /**
   * Authenticate a client for participation in a specific game by supplying
   * either the game’s UUID or its 6-digit PIN.
   *
   * @param authGameRequest – The request DTO containing **either**
   *   - `gameId` (UUID) to look up the game by its internal ID, **or**
   *   - `gamePIN` (6-digit string) to look up the game by its PIN.
   * @param authorization - Optional Bearer token of an authenticated user.
   * @param ipAddress - The client's IP address, extracted via the `@IpAddress()` decorator.
   * @param userAgent - The client's User-Agent header, extracted via the `@UserAgent()` decorator.
   * @returns A pair of access + refresh tokens scoped to the specified game.
   */
  @Public()
  @Post('/game')
  @ApiOperation({
    summary: 'Game authentication',
    description:
      'Issue access and refresh tokens for participating in a game by providing either its UUID or 6-digit PIN.',
  })
  @ApiBody({
    description:
      'Payload containing either `gameId` (UUID) or `gamePIN` (6-digit string) to identify the game.',
    type: AuthGameRequest,
  })
  @ApiOkResponse({
    type: AuthResponse,
    description: 'Game access and refresh tokens.',
  })
  @ApiBadRequestResponse({ description: 'Invalid game PIN format.' })
  @ApiUnauthorizedResponse({
    description: 'No active game found with that ID or PIN.',
  })
  @HttpCode(HttpStatus.OK)
  public async authenticateGame(
    @Body() authGameRequest: AuthGameRequest,
    @IpAddress() ipAddress: string,
    @UserAgent() userAgent: string,
    @Headers('Authorization') authorization?: string,
  ): Promise<AuthResponse> {
    const optionalUserId =
      await this.extractUserIdFromAuthorizationHeader(authorization)
    return this.authService.authenticateGame(
      authGameRequest,
      ipAddress,
      userAgent,
      optionalUserId,
    )
  }

  /**
   * Validates the provided refresh token and issues a new access token
   * (and rotates the refresh token if applicable).
   *
   * @param authRefreshRequest - Request containing the existing refresh token.
   * @param ipAddress - The client's IP address, extracted via the `@IpAddress()` decorator.
   * @param userAgent - The client's User-Agent header, extracted via the `@UserAgent()` decorator.
   * @returns Promise resolving to an AuthResponse with new tokens.
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
    type: AuthResponse,
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
    @IpAddress() ipAddress: string,
    @UserAgent() userAgent: string,
  ): Promise<AuthResponse> {
    return this.authService.refresh(authRefreshRequest, ipAddress, userAgent)
  }

  /**
   * Revokes the specified JWT token, invalidating it for future use.
   *
   * @param authRevokeRequest - Request containing the JWT token to revoke.
   * @returns A promise that resolves when the token has been successfully revoked.
   */
  @Public()
  @Post('/revoke')
  @ApiOperation({
    summary: 'Revoke a JWT token',
    description:
      'Invalidates the provided JWT so it can no longer be used for authentication.',
  })
  @ApiNoContentResponse({
    description: 'Token successfully revoked.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async revoke(
    @Body() authRevokeRequest: AuthRevokeRequest,
  ): Promise<void> {
    return this.tokenService.revoke(authRevokeRequest.token)
  }

  /**
   * Change the authenticated user’s password.
   *
   * Allows a user to update their password by providing their current password
   * for verification and a new password to apply. Returns no content on success.
   *
   * @param authPasswordChangeRequest - DTO containing `oldPassword` and `newPassword`.
   * @param principalId - The UUID of the user whose password will be changed.
   * @returns A promise that resolves when the password has been successfully updated.
   * @throws BadRequestException if the provided old password does not match the stored password.
   * @throws UnauthorizedException if the request lacks valid authentication.
   * @throws ForbiddenException if the user is not a local account.
   */
  @Patch('/password')
  @ApiOperation({
    summary: 'Change authenticated user’s password',
    description:
      'Endpoint for authenticated users to change their password by supplying their current password for verification and a new desired password.',
  })
  @ApiNoContentResponse({
    description: 'Password changed successfully.',
  })
  @ApiBadRequestResponse({
    description:
      'Old password incorrect or user account not eligible for password change.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication credentials.',
  })
  @ApiForbiddenResponse({
    description: 'Non-local accounts cannot change password.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async changePassword(
    @Body() authPasswordChangeRequest: AuthPasswordChangeRequest,
    @PrincipalId() principalId: string,
  ): Promise<void> {
    return this.userService.changePassword(
      principalId,
      authPasswordChangeRequest.oldPassword,
      authPasswordChangeRequest.newPassword,
    )
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
      const payload = await this.tokenService.verifyToken(accessToken)
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
