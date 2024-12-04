import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthRequestDto, AuthResponseDto, TokenDto } from '@quiz/common'

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
