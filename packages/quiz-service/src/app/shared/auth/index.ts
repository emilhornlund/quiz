/**
 * Public exports for shared authentication primitives.
 *
 * This module must not import from domain modules.
 * It exists to prevent cycles between decorators and guards.
 */
export * from './auth-guard.interface'
export * from './decorator-constants'
