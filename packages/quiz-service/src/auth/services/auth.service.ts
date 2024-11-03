import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { GameParticipantType, GameTokenDto } from '@quiz/common'

/**
 * Service responsible for handling JWT operations for game participants,
 * including token generation and verification.
 */
@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

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
