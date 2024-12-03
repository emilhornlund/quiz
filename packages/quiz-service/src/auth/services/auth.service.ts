import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  AuthRequestDto,
  AuthResponseDto,
  GameParticipantType,
  GameTokenDto,
} from '@quiz/common'

import { ClientService } from '../../client/services'

/**
 * Service responsible for handling JWT operations for game participants,
 * including token generation and verification.
 */
@Injectable()
export class AuthService {
  /**
   * Initializes the AuthService.
   *
   * @param {ClientService} clientService - Service to manage client data.
   * @param {JwtService} jwtService - Service for generating and verifying JWT tokens.
   */
  constructor(
    private clientService: ClientService,
    private jwtService: JwtService,
  ) {}

  /**
   * Authenticates a client by generating a JWT token.
   *
   * @param {AuthRequestDto} authRequest - The request containing the client's unique identifier.
   *
   * @returns {Promise<AuthResponseDto>} A promise resolving to an `AuthResponseDto`, which includes
   *          the generated JWT token, client information, and player information.
   */
  public async authenticate(
    authRequest: AuthRequestDto,
  ): Promise<AuthResponseDto> {
    const {
      id: clientId,
      clientIdHash,
      player: { id: playerId, nickname },
    } = await this.clientService.findOrCreateClient(authRequest.clientId)

    const token = await this.jwtService.signAsync(
      {},
      { subject: clientIdHash, expiresIn: '1h' },
    )

    return {
      token,
      client: { id: clientId, name: '' },
      player: { id: playerId, nickname },
    }
  }

  /**
   * Signs a JWT token for a game participant with specified parameters.
   *
   * @param {string} gameID - Unique identifier for the game.
   * @param {string} hostClientId - Unique identifier for the host client.
   * @param {GameParticipantType} gameParticipantType - The type of game participant (host or player).
   * @param {number} expiration - Expiration time for the token in Unix timestamp.
   *
   * @returns A signed JWT token as a Promise.
   */
  public async signGameToken(
    gameID: string,
    hostClientId: string,
    gameParticipantType: GameParticipantType,
    expiration: number,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { gameID, role: gameParticipantType, exp: expiration },
      {
        subject: hostClientId,
      },
    )
  }

  /**
   * Verifies a JWT token and returns the decoded payload.
   *
   * @param {string} token - The JWT token to be verified.
   *
   * @returns {Promise<GameTokenDto>} A Promise that resolves to the decoded payload as a `GameTokenDto`.
   *
   * @throws {UnauthorizedException} If the token is invalid or verification fails.
   */
  public async verifyGameToken(token: string): Promise<GameTokenDto> {
    try {
      return await this.jwtService.verifyAsync<GameTokenDto>(token)
    } catch {
      throw new UnauthorizedException()
    }
  }
}
