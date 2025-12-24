import type {
  DiscriminatedRules,
  DiscriminatedUnion,
  DiscriminatorKey,
  DtoRules,
  OptionalKeys,
  ValidationError,
  ValidationRules,
} from '../model'

import {
  isArrayRule,
  isBooleanRule,
  isMissing,
  isNumberRule,
  isObject,
  isObjectRule,
  isStringRule,
  shouldRequireKey,
} from './guards'
import type { ValidationResult } from './result'
import { buildValidationResult } from './result'
import type { AnyRule } from './types'

/**
 * Internal validation context carried through recursive validation.
 *
 * - `path` is the current object path used when constructing error paths.
 * - `optionalKeys` controls default requiredness at the current object level.
 * - `root` is the original DTO input and is passed to custom validators for cross-field checks.
 */
type ValidationContext = {
  /**
   * Current path prefix for nested validation.
   */
  path: string

  /**
   * Keys treated as optional at the current validation level.
   */
  optionalKeys: readonly string[]

  /**
   * The root DTO value being validated.
   *
   * Used by custom validators that need cross-field access.
   */
  root: unknown
}

/**
 * Validates a value against a concrete DTO rule set.
 *
 * Returns a structured validation result containing:
 * - a boolean `valid` flag
 * - a list of `errors`
 * - per-field and per-path invalid maps for UI consumption
 */
export function validateDto<T extends object>(
  value: unknown,
  dtoRules: DtoRules<T, readonly OptionalKeys<T>[]>,
): ValidationResult<T> {
  const errors = validateObject(value, dtoRules.rules, {
    path: '',
    optionalKeys: dtoRules.optionalKeys as readonly string[],
    root: value,
  })
  return buildValidationResult<T>(errors)
}

/**
 * Validates a value against a discriminated union rule set.
 *
 * Behavior:
 * - Requires the input to be an object
 * - Requires the discriminator key to be present
 * - Selects a variant ruleset based on the discriminator value
 * - Returns structured validation results for the selected variant
 */
export function validateDiscriminatedDto<
  Union extends DiscriminatedUnion<K>,
  K extends DiscriminatorKey,
>(
  value: unknown,
  discriminated: DiscriminatedRules<Union, K>,
): ValidationResult<Union> {
  if (!isObject(value)) {
    return buildValidationResult<Union>([
      { path: '$', code: 'type', message: 'Expected an object.' },
    ])
  }

  const discriminatorKey = String(discriminated.discriminator)
  const discriminatorValue = value[discriminatorKey]

  if (isMissing(discriminatorValue)) {
    return buildValidationResult<Union>([
      { path: discriminatorKey, code: 'required', message: 'Required.' },
    ])
  }

  if (
    typeof discriminatorValue !== 'string' &&
    typeof discriminatorValue !== 'number'
  ) {
    return buildValidationResult<Union>([
      {
        path: discriminatorKey,
        code: 'type',
        message: 'Invalid discriminator type.',
      },
    ])
  }

  /**
   * Runtime representation of DTO rules after generic type erasure.
   */
  type DtoRulesRuntime = {
    rules: ValidationRules<object>
    optionalKeys: readonly string[]
  }

  const variants = discriminated.variants as unknown as Record<
    string | number,
    DtoRulesRuntime | undefined
  >

  const variant = variants[discriminatorValue]

  if (!variant) {
    return buildValidationResult<Union>([
      {
        path: discriminatorKey,
        code: 'oneOf',
        message: 'Unknown discriminator value.',
      },
    ])
  }

  const errors = validateObject(
    value,
    variant.rules as ValidationRules<object>,
    {
      path: '',
      optionalKeys: variant.optionalKeys as readonly string[],
      root: value,
    },
  )

  return buildValidationResult<Union>(errors)
}

/**
 * Validates an object against a set of property rules.
 *
 * This function is recursive and drives nested object and array validation.
 */
function validateObject<T extends object>(
  value: unknown,
  rules: ValidationRules<T>,
  ctx: ValidationContext,
): ValidationError[] {
  if (!isObject(value)) {
    return [
      {
        path: ctx.path || '$',
        code: 'type',
        message: 'Expected an object.',
      },
    ]
  }

  const errors: ValidationError[] = []

  for (const key of Object.keys(rules) as (keyof T)[]) {
    const keyString = String(key)
    const keyPath = ctx.path ? `${ctx.path}.${keyString}` : keyString
    const prop = value[keyString]

    const rule = rules[key] as unknown as AnyRule

    const required = shouldRequireKey(
      keyString,
      rule.required,
      ctx.optionalKeys,
    )

    if (required && isMissing(prop)) {
      errors.push({ path: keyPath, code: 'required', message: 'Required.' })
      continue
    }

    if (!required && isMissing(prop)) continue

    if (isArrayRule(rule)) {
      if (!Array.isArray(prop)) {
        errors.push({
          path: keyPath,
          code: 'type',
          message: 'Expected an array.',
        })
        continue
      }

      if (rule.oneOf && !rule.oneOf.includes(prop as never)) {
        errors.push({ path: keyPath, code: 'oneOf', message: 'Invalid value.' })
      }

      if (rule.custom) {
        const res = rule.custom({
          value: prop as never,
          dto: ctx.root as never,
          path: keyPath,
        })
        if (res) errors.push({ path: keyPath, code: 'custom', message: res })
      }

      if (typeof rule.minItems === 'number' && prop.length < rule.minItems) {
        errors.push({
          path: keyPath,
          code: 'min',
          message: `Must have at least ${rule.minItems} items.`,
        })
      }

      if (typeof rule.maxItems === 'number' && prop.length > rule.maxItems) {
        errors.push({
          path: keyPath,
          code: 'max',
          message: `Must have at most ${rule.maxItems} items.`,
        })
      }

      const elementRule = rule.element as unknown as AnyRule

      prop.forEach((item, i) => {
        const itemPath = `${keyPath}[${i}]`

        if (isObjectRule(elementRule)) {
          if (!isObject(item)) {
            errors.push({
              path: itemPath,
              code: 'type',
              message: 'Expected an object.',
            })
            return
          }

          let elementCustomFailed = false
          if (elementRule.custom) {
            const res = elementRule.custom({
              value: item as never,
              dto: ctx.root as never,
              path: itemPath,
            })
            if (res) {
              errors.push({ path: itemPath, code: 'custom', message: res })
              elementCustomFailed = true
            }
          }

          if (!elementCustomFailed) {
            errors.push(
              ...validateObject(
                item,
                elementRule.shape as ValidationRules<object>,
                {
                  path: itemPath,
                  optionalKeys: (elementRule.optionalKeys ??
                    []) as readonly string[],
                  root: ctx.root,
                },
              ),
            )
          }
        } else {
          errors.push(...validatePrimitive(item, elementRule, itemPath, ctx))
        }
      })

      continue
    }

    if (isObjectRule(rule)) {
      if (!isObject(prop)) {
        errors.push({
          path: keyPath,
          code: 'type',
          message: 'Expected an object.',
        })
        continue
      }

      if (rule.custom) {
        const res = rule.custom({
          value: prop as never,
          dto: ctx.root as never,
          path: keyPath,
        })
        if (res) errors.push({ path: keyPath, code: 'custom', message: res })
      }

      errors.push(
        ...validateObject(prop, rule.shape as ValidationRules<object>, {
          path: keyPath,
          optionalKeys: (rule.optionalKeys ?? []) as readonly string[],
          root: ctx.root,
        }),
      )
      continue
    }

    errors.push(...validatePrimitive(prop, rule, keyPath, ctx))
  }

  return errors
}

/**
 * Validates primitive values (string/number/boolean) against a rule.
 *
 * Handles type checks, constraints, and optional custom validators.
 */
function validatePrimitive(
  prop: unknown,
  rule: AnyRule,
  keyPath: string,
  ctx: ValidationContext,
): ValidationError[] {
  const errors: ValidationError[] = []

  if (isStringRule(rule)) {
    if (typeof prop !== 'string') {
      errors.push({
        path: keyPath,
        code: 'type',
        message: 'Expected a string.',
      })
      return errors
    }

    if (rule.oneOf && !rule.oneOf.includes(prop as never)) {
      errors.push({ path: keyPath, code: 'oneOf', message: 'Invalid value.' })
    }

    if (typeof rule.minLength === 'number' && prop.length < rule.minLength) {
      errors.push({
        path: keyPath,
        code: 'minLength',
        message: `Must be at least ${rule.minLength} characters.`,
      })
    }

    if (typeof rule.maxLength === 'number' && prop.length > rule.maxLength) {
      errors.push({
        path: keyPath,
        code: 'maxLength',
        message: `Must be at most ${rule.maxLength} characters.`,
      })
    }

    if (rule.regex && !rule.regex.test(prop)) {
      errors.push({ path: keyPath, code: 'regex', message: 'Invalid format.' })
    }

    if (rule.custom) {
      const res = rule.custom({
        value: prop as never,
        dto: ctx.root as never,
        path: keyPath,
      })
      if (res) errors.push({ path: keyPath, code: 'custom', message: res })
    }

    return errors
  }

  if (isNumberRule(rule)) {
    if (typeof prop !== 'number' || Number.isNaN(prop)) {
      errors.push({
        path: keyPath,
        code: 'type',
        message: 'Expected a number.',
      })
      return errors
    }

    if (rule.oneOf && !rule.oneOf.includes(prop as never)) {
      errors.push({ path: keyPath, code: 'oneOf', message: 'Invalid value.' })
    }

    if (typeof rule.min === 'number' && prop < rule.min) {
      errors.push({
        path: keyPath,
        code: 'min',
        message: `Must be >= ${rule.min}.`,
      })
    }

    if (typeof rule.max === 'number' && prop > rule.max) {
      errors.push({
        path: keyPath,
        code: 'max',
        message: `Must be <= ${rule.max}.`,
      })
    }

    if (rule.integer && !Number.isInteger(prop)) {
      errors.push({
        path: keyPath,
        code: 'integer',
        message: 'Must be an integer.',
      })
    }

    if (rule.custom) {
      const res = rule.custom({
        value: prop as never,
        dto: ctx.root as never,
        path: keyPath,
      })
      if (res) errors.push({ path: keyPath, code: 'custom', message: res })
    }

    return errors
  }

  if (isBooleanRule(rule)) {
    if (typeof prop !== 'boolean') {
      errors.push({
        path: keyPath,
        code: 'type',
        message: 'Expected a boolean.',
      })
      return errors
    }

    if (rule.oneOf && !rule.oneOf.includes(prop as never)) {
      errors.push({ path: keyPath, code: 'oneOf', message: 'Invalid value.' })
    }

    if (rule.custom) {
      const res = rule.custom({
        value: prop as never,
        dto: ctx.root as never,
        path: keyPath,
      })
      if (res) errors.push({ path: keyPath, code: 'custom', message: res })
    }

    return errors
  }

  errors.push({ path: keyPath, code: 'type', message: 'Invalid rule kind.' })
  return errors
}
