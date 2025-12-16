import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

/**
 * Custom validator to ensure a property falls within the range defined by two other properties.
 *
 * Example usage:
 * ```ts
 * @Validate(InRangeValidator, ['value', 'min', 'max'])
 * value: number
 * ```
 */
@ValidatorConstraint({ name: 'inRangeValidator', async: false })
export class InRangeValidator<T> implements ValidatorConstraintInterface {
  /**
   * Checks if the value is within the specified min and max bounds.
   *
   * @param value - The current property value being validated.
   * @param args - The validation context including constraints and the full object.
   * @returns `true` if the value is within range, otherwise `false`.
   */
  validate(value: unknown, args: ValidationArguments) {
    const object = args.object as T
    const fieldProperty = args.constraints[0] as keyof T
    const minProperty = args.constraints[1] as keyof T
    const maxProperty = args.constraints[2] as keyof T

    return (
      object[fieldProperty] >= object[minProperty] &&
      object[fieldProperty] <= object[maxProperty]
    )
  }

  /**
   * Builds the default validation error message.
   *
   * @param args - The validation arguments containing constraint keys.
   * @returns A string indicating the required range.
   */
  defaultMessage(args: ValidationArguments) {
    const fieldProperty = args.constraints[0]
    const minProperty = args.constraints[1]
    const maxProperty = args.constraints[2]
    return `${fieldProperty} must be within the range of ${minProperty} and ${maxProperty}`
  }
}
