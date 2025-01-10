/**
 * Checks if a provided callback validates the given value.
 *
 * @param value - The value to validate. Can be of any type.
 * @param callback - An optional function that takes the value as input and returns a boolean or a string.
 *   - If the callback returns `false`, the validation fails, and no error message is returned.
 *   - If the callback returns a string, the validation fails, and the string is used as an error message.
 *   - If the callback is not provided or the value is `undefined`, the validation is considered successful.
 *
 * @returns A tuple:
 *   - `[true, undefined]` if validation succeeds.
 *   - `[false, undefined]` if validation fails without an error message.
 *   - `[false, string]` if validation fails with an error message.
 */
export const isCallbackValid = <T>(
  value?: T,
  callback?: (value: T) => boolean | string,
): [boolean, string | undefined] => {
  if (callback) {
    const additionalValid = value !== undefined ? callback(value) : undefined

    if (typeof additionalValid === 'boolean' && !additionalValid) {
      return [false, undefined]
    }

    if (typeof additionalValid === 'string') {
      return [false, additionalValid]
    }
  }

  return [true, undefined]
}

/**
 * Validates a string value based on various conditions such as required status, length, and regex pattern.
 *
 * @param options.value - The text value to validate. Can be a string or number.
 * @param options.disabled - Specifies if validation should be skipped.
 * @param options.required - Specifies if the value is required. If a string is provided, it is used as the error message.
 * @param options.minLength - The minimum allowed length for the value.
 * @param options.maxLength - The maximum allowed length for the value.
 * @param options.regex - A regular expression or an object containing a regex and a custom error message for validation.
 *
 * @returns A tuple containing a boolean indicating validity and an optional error message.
 */
export const isValidString = (options: {
  value?: string
  disabled?: boolean
  required?: boolean | string
  minLength?: number
  maxLength?: number
  regex?: RegExp | { value: RegExp; message: string }
}): [boolean, string | undefined] => {
  // Skip validation if the field is disabled
  if (options.disabled) {
    return [true, undefined]
  }

  // Check if the value is a valid string and satisfies the required condition
  if (
    typeof options.value !== 'string' ||
    (options.required && !options.value.length)
  ) {
    return [
      false,
      typeof options.required === 'string'
        ? options.required
        : 'This field is required',
    ]
  }

  // Validate minimum length
  if (
    options.value &&
    options.minLength &&
    options.value.length < options.minLength
  ) {
    return [false, `Minimum length must be greater than ${options.minLength}`]
  }

  // Validate maximum length
  if (
    options.value &&
    options.maxLength &&
    options.value.length > options.maxLength
  ) {
    return [false, `Maximum length must be less than ${options.maxLength}`]
  }

  // Validate against the provided regex pattern
  if (
    options.value &&
    options.regex &&
    !(
      options.regex instanceof RegExp ? options.regex : options.regex.value
    ).test(options.value)
  ) {
    return [
      false,
      options.regex instanceof RegExp
        ? "Can't contain illegal character"
        : options.regex.message,
    ]
  }

  return [true, undefined]
}

/**
 * Validates a numeric value based on various conditions such as required status, minimum, and maximum values.
 *
 * @param options - The validation options.
 * @param options.value - The numeric value to validate. Can be a string or number.
 * @param options.disabled - Specifies if validation should be skipped.
 * @param options.required - Specifies if the value is required. If a string is provided, it is used as the error message.
 * @param options.min - The minimum allowed value.
 * @param options.max - The maximum allowed value.
 *
 * @returns A tuple containing a boolean indicating validity and an optional error message.
 */
export const isValidNumber = (options: {
  value?: number
  disabled?: boolean
  required?: boolean | string
  min?: number
  max?: number
}): [boolean, string | undefined] => {
  // Skip validation if the field is disabled
  if (options.disabled) {
    return [true, undefined]
  }

  // Check if the value satisfies the required condition
  if (options.required && options.value === undefined) {
    return [
      false,
      typeof options.required === 'string'
        ? options.required
        : 'This field is required',
    ]
  }

  // Validate that the value is a valid number
  if (typeof options.value !== 'number' || Number.isNaN(options.value)) {
    return [false, 'Must be a valid number']
  }

  // Validate minimum value
  if (options.min !== undefined && options.value < options.min) {
    return [false, `Cannot be less than ${options.min}`]
  }

  // Validate maximum value
  if (options.max !== undefined && options.value > options.max) {
    return [false, `Cannot be greater than ${options.max}`]
  }

  return [true, undefined]
}
