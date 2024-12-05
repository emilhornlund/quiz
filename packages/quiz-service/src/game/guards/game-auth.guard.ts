import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GameParticipantType } from '@quiz/common'

import { GAME_PARTICIPANT_TYPE } from '../controllers/decorators/auth'
import { GameRepository } from '../services'

/**
 * Guard to authorize access to game-related operations based on the participant type.
 *
 * Ensures that the authenticated player is allowed to access or modify the requested game.
 * Throws exceptions if the game ID is invalid or the player does not have sufficient permissions.
 */
@Injectable()
export class GameAuthGuard implements CanActivate {
  /**
   * Initializes the GameAuthGuard.
   *
   * @param reflector - Used for retrieving metadata, such as the participant type.
   * @param gameRepository - Repository for interacting with game data.
   */
  constructor(
    private reflector: Reflector,
    private readonly gameRepository: GameRepository,
  ) {}

  /**
   * Validates whether the incoming request has proper access to a game resource.
   *
   * @param context - The context of the current request.
   *
   * @returns True if the request is authorized; otherwise, it throws an exception.
   *
   * @throws {BadRequestException} if the game ID is missing or malformed.
   * @throws {ForbiddenException} if the player is not authorized for the game.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const requiredParticipantType =
      this.reflector.getAllAndOverride<GameParticipantType>(
        GAME_PARTICIPANT_TYPE,
        [context.getHandler(), context.getClass()],
      )

    const gameID: string = request.params.gameID
    if (!gameID) {
      throw new BadRequestException()
    }

    const playerId = request.client.player._id as string

    const game = await this.gameRepository.findGameByIDOrThrow(gameID, true)

    const participant = game.participants.find(
      (participant) => participant.client.player._id === playerId,
    )

    if (!participant || participant.type !== requiredParticipantType) {
      throw new ForbiddenException()
    }

    return true
  }
}
