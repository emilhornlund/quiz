import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  AuthLoginRequestDto,
  AuthLoginResponseDto,
  Authorities,
  LegacyAuthRequestDto,
  LegacyAuthResponseDto,
  TokenDto,
} from '@quiz/common'
import { AuthRefreshRequestDto } from '@quiz/common/src'

import { ClientService } from '../../client/services'
import { UserService } from '../../user/services'

/**
 * Service responsible for authenticating users and clients
 * and managing JWT token issuance (login, legacy auth, and refresh).
 */
@Injectable()
export class AuthService {
  // Logger instance for recording service operations.
  private readonly logger: Logger = new Logger(AuthService.name)

  /**
   * Initializes the AuthService.
   *
   * @param userService - Service for user credential verification.
   * @param clientService - Service to manage client data.
   * @param jwtService - Service for generating and verifying JWT tokens.
   */
  constructor(
    private readonly userService: UserService,
    private clientService: ClientService,
    private jwtService: JwtService,
  ) {}

  /**
   * Authenticates a user by email and password, then issues a new pair of JWTs.
   *
   * @param authLoginRequestDto - DTO containing the user's email and password.
   * @returns Promise resolving to an AuthLoginResponseDto with access & refresh tokens.
   * @throws BadCredentialsException if credentials are invalid.
   */
  public async login(
    authLoginRequestDto: AuthLoginRequestDto,
  ): Promise<AuthLoginResponseDto> {
    const user = await this.userService.verifyUserCredentialsOrThrow(
      authLoginRequestDto.email,
      authLoginRequestDto.password,
    )
    return this.signTokenPair(user._id)
  }

  /**
   * Validates the provided refresh token and issues a new pair of JWTs.
   *
   * @param authRefreshRequestDto - DTO containing the refresh token.
   * @returns Promise resolving to an AuthLoginResponseDto with fresh tokens.
   * @throws UnauthorizedException if token is invalid or missing REFRESH_AUTH authority.
   */
  public async refresh(
    authRefreshRequestDto: AuthRefreshRequestDto,
  ): Promise<AuthLoginResponseDto> {
    let result: Pick<TokenDto, 'sub' | 'authorities'>

    try {
      result = await this.jwtService.verifyAsync<TokenDto>(
        authRefreshRequestDto.refreshToken,
      )
    } catch (error) {
      const { message, stack } = error as Error
      this.logger.debug(`Failed to verify refresh token: '${message}'.`, stack)
      throw new UnauthorizedException()
    }

    if (!result.authorities.includes(Authorities.RefreshAuth)) {
      this.logger.debug(
        `Failed to refresh token since missing '${Authorities.RefreshAuth}' authority.`,
      )
      throw new UnauthorizedException()
    }

    this.logger.debug(`Refreshing token with userId '${result.sub}'.`)
    return this.signTokenPair(result.sub)
  }

  /**
   * Generates a new access token (15m) and refresh token (30d) for the given user.
   *
   * @param userId - The subject (user ID) for whom to sign the tokens.
   * @returns Promise resolving to AuthLoginResponseDto with both tokens.
   * @private
   */
  private async signTokenPair(userId: string): Promise<AuthLoginResponseDto> {
    const accessToken = await this.jwtService.signAsync(
      { authorities: [] },
      { subject: userId, expiresIn: '15m' },
    )

    const refreshToken = await this.jwtService.signAsync(
      { authorities: [Authorities.RefreshAuth] },
      { subject: userId, expiresIn: '30d' },
    )

    return { accessToken, refreshToken }
  }

  /**
   * Authenticates a client by generating a JWT token.
   *
   * @param {LegacyAuthRequestDto} authRequest - The request containing the client's unique identifier.
   *
   * @returns {Promise<LegacyAuthResponseDto>} A promise resolving to an `LegacyAuthResponseDto`, which includes
   *          the generated JWT token, client information, and player information.
   */
  public async legacyAuthenticate(
    authRequest: LegacyAuthRequestDto,
  ): Promise<LegacyAuthResponseDto> {
    const {
      _id: clientId,
      clientIdHash,
      player: { _id: playerId, nickname },
    } = await this.clientService.findOrCreateClient(authRequest.clientId)

    const token = await this.jwtService.signAsync(
      { authorities: [Authorities.LegacyAuth] },
      { subject: clientIdHash, expiresIn: '1h' },
    )

    return {
      token,
      client: { id: clientId, name: '' },
      player: { id: playerId, nickname },
    }
  }

  /**
   * Verifies a JWT token and returns the decoded payload.
   *
   * @param {string} token - The JWT token to be verified.
   *
   * @returns {Promise<TokenDto>} A Promise that resolves to the decoded payload as a `TokenDto`.
   *
   * @throws {UnauthorizedException} If the token is invalid or verification fails.
   */
  public async verifyToken(token: string): Promise<TokenDto> {
    try {
      return await this.jwtService.verifyAsync<TokenDto>(token)
    } catch {
      throw new UnauthorizedException()
    }
  }
}
