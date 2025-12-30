import type { ValidationError } from '../model'
import { topLevelFieldFromPath } from '../utils'

/**
 * Per-field validation map for a DTO, keyed by top-level DTO field.
 *
 * Fields only appear when invalid.
 */
export type FieldValidation<T extends object> = {
  [K in keyof T]?: boolean
}

/**
 * Per-path validation map using the runtime path notation.
 *
 * Paths only appear when invalid.
 */
export type PathValidation = Record<string, boolean>

/**
 * Validation result returned by the runtime validator.
 */
export type ValidationResult<T extends object> = {
  /**
   * True when no validation errors were produced.
   */
  valid: boolean

  /**
   * List of validation errors.
   */
  errors: ValidationError[]

  /**
   * Top-level field validity map.
   */
  fields: FieldValidation<T>

  /**
   * Full path validity map.
   */
  paths: PathValidation
}

/**
 * Builds a `ValidationResult` structure from a list of errors.
 *
 * Produces:
 * - `valid` as `errors.length === 0`
 * - `fields` based on top-level field extraction from each error path
 * - `paths` keyed by the full error path
 */
export const buildValidationResult = <T extends object>(
  errors: ValidationError[],
): ValidationResult<T> => {
  const fields: FieldValidation<T> = {}
  const paths: PathValidation = {}

  for (const e of errors) {
    paths[e.path] = false

    const field = topLevelFieldFromPath(e.path) as keyof T
    fields[field] = false
  }

  return {
    valid: errors.length === 0,
    errors,
    fields,
    paths,
  }
}
