import type { AnyRule } from './types'

/**
 * Type guard that checks whether a value is a plain object (not null, not an array).
 */
export const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Returns true if a value should be treated as missing for requiredness checks.
 */
export const isMissing = (v: unknown) => v === undefined || v === null

/**
 * Computes whether a key should be required.
 *
 * Priority:
 * - If `rule.required` is explicitly set, it wins.
 * - Otherwise, requiredness is derived from `optionalKeys`.
 */
export const shouldRequireKey = (
  key: string,
  ruleRequired: boolean | undefined,
  optionalKeys: readonly string[],
): boolean => {
  if (ruleRequired !== undefined) return ruleRequired
  return !optionalKeys.includes(key)
}

/**
 * Rule kind guards used by the runtime validator.
 */
export const isArrayRule = (rule: AnyRule) => rule.kind === 'array'
export const isObjectRule = (rule: AnyRule) => rule.kind === 'object'
export const isStringRule = (rule: AnyRule) => rule.kind === 'string'
export const isNumberRule = (rule: AnyRule) => rule.kind === 'number'
export const isBooleanRule = (rule: AnyRule) => rule.kind === 'boolean'
