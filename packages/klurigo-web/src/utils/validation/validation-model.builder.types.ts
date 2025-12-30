/**
 * Validation rules applicable to string values.
 *
 * - `required`: If true, empty values are invalid.
 * - `minLength`: Minimum allowed string length.
 * - `maxLength`: Maximum allowed string length.
 * - `regex`: Regular expression the value must match.
 */
export type StringRules = {
  required?: boolean
  minLength?: number
  maxLength?: number
  regex?: RegExp
}

/**
 * Validation rules applicable to non-string values.
 *
 * Currently supports:
 * - `required`: If true, empty values are invalid.
 *
 * This can be extended over time with additional non-string rules
 * (e.g. `min`, `max`, `oneOf`, etc).
 */
export type NonStringRules = {
  required?: boolean
}

/**
 * Per-field rule type selection.
 *
 * Applies `StringRules` when the field is `string` or `string | undefined`.
 * Falls back to `NonStringRules` for all other field types.
 */
export type FieldRules<V> = V extends string | undefined
  ? StringRules
  : NonStringRules

/**
 * Rule map for a given object type.
 *
 * - Keys are all required keys of `T` to ensure rule completeness.
 * - Values are selected by `FieldRules<T[K]>` to prevent invalid rule usage.
 */
export type ValidationRules<T extends object> = {
  [K in keyof Required<T>]: FieldRules<T[K]>
}

/**
 * Boolean validation model for a given object type.
 *
 * - Keys map to the object fields.
 * - Values indicate whether each field is currently valid.
 */
export type ValidationModel<T extends object> = {
  [K in keyof Required<T>]?: boolean
}

/**
 * Error messages per field for a given object type.
 *
 * Each key contains a list of validation messages explaining why validation failed.
 */
export type ValidationErrors<T extends object> = {
  [K in keyof Required<T>]?: string[]
}

/**
 * Result returned from `buildValidationModel`.
 *
 * - `validation`: Per-field validity state.
 * - `errors`: Per-field error messages (only present when invalid).
 * - `valid`: Aggregated validity across all fields.
 */
export type BuildValidationResult<T extends object> = {
  validation: ValidationModel<T>
  errors: ValidationErrors<T>
  valid: boolean
}
