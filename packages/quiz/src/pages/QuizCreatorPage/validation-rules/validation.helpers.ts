import { ValidationResult } from '../../../validation'

/**
 * Retrieves the validation error message for a specific field path.
 *
 * Looks up the first validation error matching the provided path and returns
 * its message. This is intended for direct use in form components that expect
 * a single error message per field.
 *
 * If no error exists for the given path, `undefined` is returned.
 *
 * This helper does not perform any validation itself; it only reads from an
 * existing `ValidationResult`.
 *
 * @param validation - The validation result containing all validation errors.
 * @param path - The field path to look up, using dot-notation for nested fields.
 * @returns The error message for the field, or `undefined` if no error exists.
 */
export function getValidationErrorMessage<T extends object>(
  validation: ValidationResult<T>,
  path: string,
): string | undefined {
  return validation.errors.filter((error) => error.path === path)?.[0]?.message
}
