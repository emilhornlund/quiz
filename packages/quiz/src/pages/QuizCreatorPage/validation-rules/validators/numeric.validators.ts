import { CustomValidator } from '../../../../validation'

/**
 * Chains multiple validators and returns the first error message encountered.
 *
 * Useful for composing multiple numeric constraints into a single `custom` validator.
 */
export const chain =
  <TValue, TDto extends object>(
    ...validators: CustomValidator<TValue, TDto>[]
  ): CustomValidator<TValue, TDto> =>
  (args) => {
    for (const v of validators) {
      const res = v(args)
      if (res) return res
    }
    return null
  }

/**
 * Creates a numeric validator that requires the current value to be <= a DTO-derived max.
 *
 * Typical use cases:
 * - Ensuring `min <= max`
 * - Ensuring `correct <= max`
 */
export const mustBeLessThanOrEqual =
  <TDto extends object>(
    getMax: (dto: TDto) => number,
    message: string,
  ): CustomValidator<number, TDto> =>
  ({ value, dto }) =>
    value <= getMax(dto) ? null : message

/**
 * Creates a numeric validator that requires the current value to be >= a DTO-derived min.
 *
 * Typical use cases:
 * - Ensuring `max >= min`
 * - Ensuring `correct >= min`
 */
export const mustBeGreaterThanOrEqual =
  <TDto extends object>(
    getMin: (dto: TDto) => number,
    message: string,
  ): CustomValidator<number, TDto> =>
  ({ value, dto }) =>
    value >= getMin(dto) ? null : message
