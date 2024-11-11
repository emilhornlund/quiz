import { SetMetadata } from '@nestjs/common'
import { GameParticipantType } from '@quiz/common'

export const GAME_CLIENT_ROLES_KEY = 'gameClientRoles'

/**
 * Decorator for specifying required client roles for accessing a route.
 * This sets metadata with the key `GAME_CLIENT_ROLES_KEY` containing the list of roles.
 *
 * @param {...GameParticipantType[]} roles - The allowed participant roles for accessing the route.
 *
 * @returns A custom metadata decorator used by guards to validate client roles.
 */
export const GameClientRoles = (...roles: GameParticipantType[]) =>
  SetMetadata(GAME_CLIENT_ROLES_KEY, roles)
