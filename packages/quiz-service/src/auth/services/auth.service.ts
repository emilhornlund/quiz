import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  AuthLoginRequestDto,
  AuthLoginResponseDto,
  Authority,
  AuthRefreshRequestDto,
  GameParticipantType,
  GameTokenDto,
  LegacyAuthRequestDto,
  LegacyAuthResponseDto,
  TokenDto,
  TokenScope,
} from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import { ClientService } from '../../client/services'
import { GameRepository } from '../../game/services'
import { UserService } from '../../user/services'

import { getTokenAuthorities, getTokenExpiresIn } from './utils'

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
   * @param gameRepository - Repository for accessing game data.
   * @param clientService - Service to manage client data.
   * @param jwtService - Service for generating and verifying JWT tokens.
   */
  constructor(
    private readonly userService: UserService,
    private readonly gameRepository: GameRepository,
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
    return this.signTokenPair(user._id, TokenScope.User)
  }

  /**
   * Authenticate into a game using its PIN.
   *
   * @param gamePIN - The game’s unique 6-digit PIN.
   * @param userId - Optional user ID to reuse (from a valid Game‐scoped user token).
   *                 If omitted, an anonymous participant ID is generated.
   * @returns Access + refresh tokens scoped to that game.
   */
  public async authenticateGame(
    gamePIN: string,
    userId?: string,
  ): Promise<AuthLoginResponseDto> {
    const game = await this.gameRepository.findGameByPINOrThrow(gamePIN)
    const gameId = game._id

    const participantId = userId || uuidv4()

    const existingParticipant = game.participants.find(
      (participant) => participant.player._id === participantId,
    )

    let participantType: GameParticipantType
    if (existingParticipant) {
      participantType = existingParticipant.type
    } else if (game.participants.length === 0) {
      participantType = GameParticipantType.HOST
    } else {
      participantType = GameParticipantType.PLAYER
    }

    this.logger.debug(
      `Authenticating game '${gameId}' and participant '${participantId}:${participantType}'.`,
    )

    return this.signTokenPair(participantId, TokenScope.Game, {
      gameId,
      participantType,
    })
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
    let payload: TokenDto

    try {
      payload = await this.jwtService.verifyAsync<TokenDto>(
        authRefreshRequestDto.refreshToken,
      )
    } catch (error) {
      const { message, stack } = error as Error
      this.logger.debug(`Failed to verify refresh token: '${message}'.`, stack)
      throw new UnauthorizedException()
    }

    if (!payload.authorities.includes(Authority.RefreshAuth)) {
      this.logger.debug(
        `Failed to refresh token since missing '${Authority.RefreshAuth}' authority.`,
      )
      throw new UnauthorizedException()
    }

    let additionalClaims = {}

    if (payload.scope === TokenScope.Game) {
      const { gameId, participantType } = payload as GameTokenDto
      additionalClaims = { gameId, participantType }
    }

    this.logger.debug(`Refreshing token with userId '${payload.sub}'.`)
    return this.signTokenPair(payload.sub, payload.scope, additionalClaims)
  }

  /**
   * Generates a new access token (15m) and refresh token (30d) for the given user.
   *
   * @param subject - The subject (user ID) for whom to sign the tokens.
   * @param scope - The broad area of the API this token grants access to (e.g. Client, Game, User).
   * @param additionalClaims - Extra payload (e.g. gameId, participantType).
   * @returns Promise resolving to AuthLoginResponseDto with both tokens.
   * @private
   */
  private async signTokenPair(
    subject: string,
    scope: TokenScope,
    additionalClaims?: Record<string, unknown>,
  ): Promise<AuthLoginResponseDto> {
    const accessToken = await this.signToken(
      subject,
      scope,
      false,
      additionalClaims,
    )
    const refreshToken = await this.signToken(
      subject,
      scope,
      true,
      additionalClaims,
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

    const token = await this.signToken(clientIdHash, TokenScope.Client, false)

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

  /**
   * Signs a JWT for the specified scope and token type.
   *
   * @param subject - The JWT “sub” claim, typically a user ID or client ID.
   * @param scope - The broad area of the API this token grants access to (e.g. Client, Game, User).
   * @param isRefreshToken - If true, issues a refresh token (long-lived); otherwise an access token (short-lived).
   * @param additionalClaims - Extra JWT payload.
   * @returns A promise resolving to the signed JWT string.
   * @private
   */
  private async signToken(
    subject: string,
    scope: TokenScope,
    isRefreshToken: boolean,
    additionalClaims?: Record<string, unknown>,
  ): Promise<string> {
    const authorities = getTokenAuthorities(scope, isRefreshToken)
    const expiresIn = getTokenExpiresIn(scope, isRefreshToken)

    return this.jwtService.signAsync(
      {
        scope,
        authorities,
        ...(additionalClaims || {}),
      },
      {
        subject,
        expiresIn,
      },
    )
  }
}
