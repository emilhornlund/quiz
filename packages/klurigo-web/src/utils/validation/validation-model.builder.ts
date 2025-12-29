import type {
  BuildValidationResult,
  NonStringRules,
  StringRules,
  ValidationErrors,
  ValidationModel,
  ValidationRules,
} from './validation-model.builder.types.ts'

/**
 * Determines whether a value should be considered "empty" for validation purposes.
 *
 * Empty values:
 * - `null`
 * - `undefined`
 * - strings containing only whitespace
 * - empty arrays
 *
 * Notes:
 * - `0` and `false` are not considered empty.
 * - Plain objects are not treated as empty by default.
 */
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim().length === 0
  }

  if (Array.isArray(value)) {
    return value.length === 0
  }

  return false
}

/**
 * Validates a value using string rules.
 *
 * Behavior:
 * - If `required` is set and the value is empty, validation fails immediately.
 * - If the value is empty and not required, the field is considered valid.
 * - If the value is present but not a string, validation fails.
 * - Applies `minLength`, `maxLength`, and `regex` checks when provided.
 *
 * @param key - Field name, used in error messages.
 * @param value - The field value to validate.
 * @param rules - String validation rules for the field.
 * @returns A list of validation error messages. Empty list means valid.
 */
function validateString(
  key: string,
  value: unknown,
  rules: StringRules,
): string[] {
  const errors: string[] = []

  if (rules.required && isEmpty(value)) {
    errors.push(`${key} is required`)
    return errors
  }

  if (isEmpty(value)) return errors

  if (typeof value !== 'string') {
    errors.push(`${key} must be a string`)
    return errors
  }

  if (rules.minLength !== undefined && value.length < rules.minLength) {
    errors.push(`${key} must be at least ${rules.minLength} characters`)
  }

  if (rules.maxLength !== undefined && value.length > rules.maxLength) {
    errors.push(`${key} must be at most ${rules.maxLength} characters`)
  }

  if (rules.regex && !rules.regex.test(value)) {
    errors.push(`${key} is not in the expected format`)
  }

  return errors
}

/**
 * Validates a value using non-string rules.
 *
 * Behavior:
 * - Applies `required` validation using the same "empty" semantics as strings.
 *
 * @param key - Field name, used in error messages.
 * @param value - The field value to validate.
 * @param rules - Non-string validation rules for the field.
 * @returns A list of validation error messages. Empty list means valid.
 */
function validateNonString(
  key: string,
  value: unknown,
  rules: NonStringRules,
): string[] {
  const errors: string[] = []

  if (rules.required && isEmpty(value)) {
    errors.push(`${key} is required`)
  }

  return errors
}

/**
 * Applies `required` only, without implying a type.
 * Useful when a field is empty; we do not want "must be a string/number" errors
 * for optional empty fields.
 */
function validateRequiredOnly(
  key: string,
  value: unknown,
  rules: { required?: boolean },
): string[] {
  if (rules.required && isEmpty(value)) {
    return [`${key} is required`]
  }
  return []
}

/**
 * Builds a validation model and error map from an object and a corresponding rule set.
 *
 * Responsibilities:
 * - Iterates over all rule keys.
 * - Validates each field using either string or non-string validation logic.
 * - Produces:
 *   - `validation`: a per-field boolean map.
 *   - `errors`: a per-field list of validation messages.
 *   - `valid`: an aggregated boolean for the entire model.
 *
 * Notes:
 *  - Runtime validation path selection is based on the runtime value:
 *    - Empty values validate only `required` (via `validateRequiredOnly`).
 *    - String values validate using `validateString`.
 *    - Non-string values validate using `validateNonString`.
 *  - `object` is `Partial<T>` to support form use-cases where fields are filled incrementally.
 *
 * @param object - The object to validate.
 * @param rules - The rule map defining how each field should be validated.
 * @returns The validation result containing per-field state, errors, and an aggregated validity flag.
 */
export function buildValidationModel<T extends object>(
  object: Partial<T>,
  rules: ValidationRules<T>,
): BuildValidationResult<T> {
  const validation: ValidationModel<T> = {}
  const errors: ValidationErrors<T> = {}

  ;(Object.keys(rules) as Array<keyof Required<T>>).forEach((key) => {
    const fieldRules = rules[key]
    const value = (object as Record<string, unknown>)[String(key)]

    let fieldErrors: string[]

    if (isEmpty(value)) {
      fieldErrors = validateRequiredOnly(String(key), value, fieldRules)
    } else if (typeof value === 'string') {
      fieldErrors = validateString(
        String(key),
        value,
        fieldRules as StringRules,
      )
    } else {
      fieldErrors = validateNonString(
        String(key),
        value,
        fieldRules as NonStringRules,
      )
    }

    const ok = fieldErrors.length === 0
    validation[key] = ok

    if (!ok) {
      errors[key] = fieldErrors
    }
  })

  const validationValues = Object.values(validation) as boolean[]
  const valid = validationValues.length > 0 && validationValues.every(Boolean)
  return { validation, errors, valid }
}
