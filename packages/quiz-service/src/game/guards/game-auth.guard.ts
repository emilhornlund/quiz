import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import {
  GameParticipantType,
  GameTokenDto,
  TokenDto,
  TokenScope,
} from '@quiz/common'

import { AuthGuardRequest } from '../../auth/guards'
import { GAME_PARTICIPANT_TYPE } from '../controllers/decorators/auth'
import { GameRepository } from '../repositories'

/**
 * Guard to authorize access to game-related operations based on the participant type.
 *
 * Ensures that the authenticated player is allowed to access or modify the requested game.
 * Throws exceptions if the game ID is missing, invalid, or the player lacks the necessary permissions.
 */
@Injectable()
export class GameAuthGuard implements CanActivate {
  /**
   * Initializes the GameAuthGuard.
   *
   * @param reflector - Used for retrieving metadata, such as the required participant type.
   * @param gameRepository - Repository for accessing and validating game data.
   */
  constructor(
    private readonly reflector: Reflector,
    private readonly gameRepository: GameRepository,
  ) {}

  /**
   * Determines whether the current request is authorized to access or modify the game resource.
   *
   * @param context - The context of the incoming HTTP request.
   * @returns A promise that resolves to `true` if authorized; otherwise, throws an exception.
   * @throws {BadRequestException} if the game ID is missing.
   * @throws {ForbiddenException} if the user or participant is not permitted.
   * @throws {UnauthorizedException} if the token scope is unrecognized.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthGuardRequest<GameTokenDto>>()

    const requiredParticipantType =
      this.reflector.getAllAndOverride<GameParticipantType>(
        GAME_PARTICIPANT_TYPE,
        [context.getHandler(), context.getClass()],
      )

    const gameID: string = request.params.gameID
    if (!gameID) {
      throw new BadRequestException()
    }

    if (request.payload.scope === TokenScope.Game) {
      await this.verifyGameScopeOrThrow(
        gameID,
        request,
        requiredParticipantType,
      )
    } else if (request.payload.scope === TokenScope.User) {
      await this.verifyUserScopeOrThrow(
        gameID,
        request,
        requiredParticipantType,
      )
    } else {
      throw new UnauthorizedException()
    }

    return true
  }

  /**
   * Verifies access for tokens scoped to a specific game.
   *
   * Ensures the token's `gameId` matches the requested game and the participant type (if required) is valid.
   *
   * @param gameID - The UUID of the game from the request path.
   * @param request - The authenticated request containing token metadata.
   * @param requiredParticipantType - Optional type of participant required to access the resource.
   * @throws {ForbiddenException} if the token is for a different game or has an invalid participant type.
   * @private
   */
  private async verifyGameScopeOrThrow(
    gameID: string,
    request: AuthGuardRequest<GameTokenDto>,
    requiredParticipantType?: GameParticipantType,
  ): Promise<void> {
    if (gameID !== request.payload.gameId) {
      throw new ForbiddenException()
    }

    if (
      requiredParticipantType &&
      requiredParticipantType !== request.payload.participantType
    ) {
      throw new ForbiddenException()
    }
  }

  /**
   * Verifies access for user-scoped tokens by checking participant membership in the game.
   *
   * Loads the game and validates that the authenticated user is a participant with the required role.
   *
   * @param gameID - The UUID of the game to validate against.
   * @param request - The authenticated request containing the user's principal ID.
   * @param requiredParticipantType - Optional type of participant required to access the resource.
   * @throws {ForbiddenException} if the user is not a participant or has an invalid participant type.
   * @private
   */
  private async verifyUserScopeOrThrow(
    gameID: string,
    request: AuthGuardRequest<TokenDto>,
    requiredParticipantType?: GameParticipantType,
  ): Promise<void> {
    const game = await this.gameRepository.findGameByIDOrThrow(gameID, false)

    const participant = game.participants.find(
      (participant) => participant.participantId === request.payload.sub,
    )

    if (
      !participant ||
      (requiredParticipantType && participant.type !== requiredParticipantType)
    ) {
      throw new ForbiddenException()
    }
  }
}
