import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { JwtService } from '@nestjs/jwt'
import {
  AuthGameRequestDto,
  AuthLoginRequestDto,
  Authority,
  AuthRefreshRequestDto,
  AuthResponseDto,
  GameParticipantType,
  GameTokenDto,
  TokenDto,
  TokenScope,
  TokenType,
} from '@quiz/common'
import ms, { StringValue } from 'ms'
import { v4 as uuidv4 } from 'uuid'

import { GameRepository } from '../../game/services'
import { GameDocument } from '../../game/services/models/schemas'
import { UserService } from '../../user/services'

import { UserLoginEvent } from './models'
import { TokenRepository } from './token.repository'
import {
  getTokenAuthorities,
  getTokenExpiresIn,
  USER_LOGIN_EVENT_KEY,
} from './utils'

/**
 * Service responsible for authenticating users and managing JWT token
 * issuance (login, legacy auth, and refresh).
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
   * @param tokenRepository - Repository for persisting and retrieving token metadata.
   * @param jwtService - Service for generating and verifying JWT tokens.
   * @param eventEmitter - EventEmitter2 instance for emitting authentication-related events.
   */
  constructor(
    private readonly userService: UserService,
    private readonly gameRepository: GameRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Authenticates a user by email and password, then issues a new pair of JWTs.
   *
   * @param authLoginRequestDto - DTO containing the user's email and password.
   * @param ipAddress - The client's IP address, used for logging and token metadata.
   * @param userAgent - The client's User-Agent string, used for logging and token metadata.
   * @returns Promise resolving to an AuthResponseDto with access & refresh tokens.
   * @throws BadCredentialsException if credentials are invalid.
   */
  public async login(
    authLoginRequestDto: AuthLoginRequestDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<AuthResponseDto> {
    const { _id: userId } = await this.userService.verifyUserCredentialsOrThrow(
      authLoginRequestDto.email,
      authLoginRequestDto.password,
    )

    const tokenPair = await this.signTokenPair(
      userId,
      TokenScope.User,
      ipAddress,
      userAgent,
    )

    await this.emitUserLoginEvent(userId)

    return tokenPair
  }

  /**
   * Authenticate into a game by its UUID or 6-digit PIN.
   *
   * @param authGameRequest – DTO containing **either**
   *   - `gameId` (UUID) to identify the game by its unique ID, **or**
   *   - `gamePIN` (6-digit string) to identify the game by its PIN.
   * @param ipAddress - The client's IP address, used for logging and token metadata.
   * @param userAgent - The client's User-Agent string, used for logging and token metadata.
   * @param userId - Optional user ID to reuse (from a valid Game‐scoped user token).
   *                 If omitted, an anonymous participant ID is generated.
   * @returns Access + refresh tokens scoped to that game.
   */
  public async authenticateGame(
    authGameRequest: AuthGameRequestDto,
    ipAddress: string,
    userAgent: string,
    userId?: string,
  ): Promise<AuthResponseDto> {
    let game: GameDocument
    try {
      game = await (authGameRequest.gameId
        ? this.gameRepository.findGameByIDOrThrow(authGameRequest.gameId)
        : this.gameRepository.findGameByPINOrThrow(authGameRequest.gamePIN))
    } catch (error) {
      const { message, stack } = error as Error
      this.logger.warn(
        `Failed to authenticate since an active game was not found: '${message}'.`,
        stack,
      )
      throw new UnauthorizedException()
    }

    const gameId = game._id

    const participantId = userId || uuidv4()

    const existingParticipant = game.participants.find(
      (participant) => participant.participantId === participantId,
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

    return this.signTokenPair(
      participantId,
      TokenScope.Game,
      ipAddress,
      userAgent,
      {
        gameId,
        participantType,
      },
    )
  }

  /**
   * Validates the provided refresh token and issues a new pair of JWTs.
   *
   * @param authRefreshRequestDto - DTO containing the refresh token.
   * @param ipAddress - The client's IP address, used for logging and token metadata.
   * @param userAgent - The client's User-Agent string, used for logging and token metadata.
   * @returns Promise resolving to an AuthResponseDto with fresh tokens.
   * @throws UnauthorizedException if token is invalid or missing REFRESH_AUTH authority.
   */
  public async refresh(
    authRefreshRequestDto: AuthRefreshRequestDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<AuthResponseDto> {
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

    try {
      await this.tokenRepository.findByIdOrThrow(payload.jti)
    } catch (error) {
      const { message, stack } = error as Error
      this.logger.debug(
        `Unable to retrieve existing refresh token: '${message}'.`,
        stack,
      )
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
    const tokenPair = await this.signTokenPair(
      payload.sub,
      payload.scope,
      ipAddress,
      userAgent,
      additionalClaims,
    )

    if (payload.scope === TokenScope.User) {
      await this.emitUserLoginEvent(payload.sub)
    }

    return tokenPair
  }

  /**
   * Revokes the specified JWT token.
   *
   * @param token - The JWT string that should be invalidated.
   * @returns A promise that resolves when the token has been revoked.
   */
  public async revoke(token: string): Promise<void> {
    try {
      const { jti } = this.jwtService.decode<TokenDto>(token)

      const document = await this.tokenRepository.findById(jti)
      if (document) {
        return this.tokenRepository.deleteByPairId(document.pairId)
      }
    } catch (error) {
      const { message, stack } = error as Error
      this.logger.debug(`Failed to revoke token: '${message}'.`, stack)
    }
  }

  /**
   * Generates a new access token (15m) and refresh token (30d) for the given user.
   *
   * @param subject - The subject (user ID) for whom to sign the tokens.
   * @param scope - The broad area of the API this token grants access to (e.g. Game, User).
   * @param ipAddress - The client's IP address to record in the token metadata.
   * @param userAgent - The client's User-Agent string to record in the token metadata.
   * @param additionalClaims - Extra payload (e.g. gameId, participantType).
   * @returns Promise resolving to AuthResponseDto with both tokens.
   * @private
   */
  private async signTokenPair(
    subject: string,
    scope: TokenScope,
    ipAddress: string,
    userAgent: string,
    additionalClaims?: Record<string, unknown>,
  ): Promise<AuthResponseDto> {
    const pairId = uuidv4()

    const accessToken = await this.signToken(
      pairId,
      subject,
      scope,
      false,
      ipAddress,
      userAgent,
      additionalClaims,
    )

    const refreshToken = await this.signToken(
      pairId,
      subject,
      scope,
      true,
      ipAddress,
      userAgent,
      additionalClaims,
    )
    return { accessToken, refreshToken }
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
   * @param pairId - Unique identifier linking an access token and its refresh token.
   * @param subject - The JWT “sub” claim, typically a user ID or game participant ID.
   * @param scope - The broad area of the API this token grants access to (e.g. Game, User).
   * @param isRefreshToken - If true, issues a refresh token (long-lived); otherwise an access token (short-lived).
   * @param ipAddress  - The client's IP address to record in the token metadata.
   * @param userAgent  - The client's User-Agent string to record in the token metadata.
   * @param additionalClaims - Extra JWT payload.
   * @returns A promise resolving to the signed JWT string.
   * @private
   */
  private async signToken(
    pairId: string,
    subject: string,
    scope: TokenScope,
    isRefreshToken: boolean,
    ipAddress: string,
    userAgent: string,
    additionalClaims?: Record<string, unknown>,
  ): Promise<string> {
    const authorities = getTokenAuthorities(scope, isRefreshToken)
    const expiresIn = getTokenExpiresIn(isRefreshToken)

    const jwtId = uuidv4()

    const token = await this.jwtService.signAsync(
      {
        scope,
        authorities,
        ...(additionalClaims || {}),
      },
      {
        jwtid: jwtId,
        subject,
        expiresIn,
      },
    )

    await this.tokenRepository.create({
      _id: jwtId,
      pairId,
      type: isRefreshToken ? TokenType.Refresh : TokenType.Access,
      scope,
      principalId: subject,
      ipAddress,
      userAgent,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + ms(expiresIn as StringValue)),
    })

    return token
  }

  /**
   * Emits a UserLoginEvent to notify subscribers that a user has logged in.
   *
   * @param userId - The unique identifier of the user whose login event is emitted.
   * @returns A Promise that resolves once the event has been emitted (errors are caught and logged).
   * @private
   */
  private async emitUserLoginEvent(userId: string): Promise<void> {
    const event: UserLoginEvent = { userId, date: new Date() }
    try {
      this.eventEmitter.emit(USER_LOGIN_EVENT_KEY, event)
    } catch (error) {
      const { message, stack } = error as Error
      this.logger.error(
        `Failed to emit user login event for userId '${userId}': '${message}.'`,
        stack,
      )
    }
  }
}
