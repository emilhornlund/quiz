import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  LegacyAuthRequestDto,
  LegacyAuthResponseDto,
  TokenDto,
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
   * @param {LegacyAuthRequestDto} authRequest - The request containing the client's unique identifier.
   *
   * @returns {Promise<LegacyAuthResponseDto>} A promise resolving to an `LegacyAuthResponseDto`, which includes
   *          the generated JWT token, client information, and player information.
   */
  public async authenticate(
    authRequest: LegacyAuthRequestDto,
  ): Promise<LegacyAuthResponseDto> {
    const {
      _id: clientId,
      clientIdHash,
      player: { _id: playerId, nickname },
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
