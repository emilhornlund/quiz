import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { GameParticipantType } from '@quiz/common'

/**
 * Service handling JWT operations for game participants.
 */
@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  /**
   * Signs a JWT token for a game participant with specified parameters.
   *
   * @param gameID - Unique identifier for the game.
   * @param hostClientId - Unique identifier for the host client.
   * @param gameParticipantType - The type of game participant (host or player).
   * @param expiration - Expiration time for the token in Unix timestamp.
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
}
