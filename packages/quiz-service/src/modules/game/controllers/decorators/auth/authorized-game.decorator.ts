import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { GameParticipantType } from '@quiz/common'

import { GAME_PARTICIPANT_TYPE } from '../../../../../app/shared/auth'
import { GameAuthGuard } from '../../../guards'

/**
 * Decorator for authorizing game-related requests.
 *
 * Applies the `GameAuthGuard` to ensure the user has the appropriate permissions
 * to access or modify a game resource.
 *
 * @returns {MethodDecorator} The method decorator to apply guards.
 */
export function AuthorizedGame(
  gameParticipantType?: GameParticipantType,
): MethodDecorator {
  return applyDecorators(
    SetMetadata(GAME_PARTICIPANT_TYPE, gameParticipantType),
    UseGuards(GameAuthGuard),
  )
}
