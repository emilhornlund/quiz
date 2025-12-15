/**
 * Public exports for shared user primitives.
 *
 * This module must not import from the user domain module.
 * It provides shared contracts and pure type guards to prevent circular dependencies.
 */
export * from './type-guards'
export * from './user.types'
