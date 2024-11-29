import { SetMetadata } from '@nestjs/common'

export const IS_LEGACY_AUTH_KEY = 'isLegacyAuth'

/**
 * Decorator to indicate that a route or controller uses legacy authentication logic.
 *
 * - Adds metadata `isLegacyAuth` with a value of `true` to the handler or class.
 *
 * Usage:
 * ```typescript
 * @LegacyAuth()
 * @Controller('example')
 * export class ExampleController {}
 * ```
 */
export const LegacyAuth = () => SetMetadata(IS_LEGACY_AUTH_KEY, true)
