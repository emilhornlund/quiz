/**
 * Shared metadata keys used by decorators and guards.
 *
 * These constants must remain stable since they define the contract between:
 * - Decorators (`SetMetadata(...)`)
 * - Guards (`Reflector.getAllAndOverride(...)`)
 *
 * This file is shared to avoid circular dependencies created by barrel exports.
 */

/**
 * Metadata key used to mark a route or controller as publicly accessible.
 */
export const IS_PUBLIC_KEY = 'isPublic'

/**
 * Metadata key under which the required authorities for a route/controller are stored.
 */
export const REQUIRED_AUTHORITIES_KEY = 'required_authorities'

/**
 * Metadata key under which the required token scopes for a route/controller are stored.
 */
export const REQUIRED_SCOPES_KEY = 'required_scopes'

/**
 * Metadata key for game participant type authorization.
 */
export const GAME_PARTICIPANT_TYPE = 'gameParticipantType'

/**
 * Metadata key for quiz public access authorization.
 */
export const AUTHORIZED_QUIZ_ALLOW_PUBLIC = 'authorizedQuizAllowPublic'
