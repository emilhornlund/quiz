/**
 * Supported validation error codes produced by the runtime validator.
 *
 * These codes are stable identifiers suitable for UI mapping and localization.
 */
export type ValidationErrorCode =
  | 'required'
  | 'type'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'regex'
  | 'oneOf'
  | 'integer'
  | 'custom'

/**
 * A single validation error produced by the runtime validator.
 */
export type ValidationError = {
  /**
   * Property path for the error, using dot/bracket notation.
   */
  path: string

  /**
   * Human-readable error message.
   */
  message: string

  /**
   * Stable error code describing the rule that failed.
   */
  code: ValidationErrorCode
}
