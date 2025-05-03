import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

/**
 * Custom validator to ensure that the minimum value does not exceed the maximum value.
 *
 * Example usage:
 * ```ts
 * @Validate(MinMaxValidator, ['min', 'max'])
 * min: number
 * max: number
 * ```
 */
@ValidatorConstraint({ name: 'minMaxValidator', async: false })
export class MinMaxValidator<T> implements ValidatorConstraintInterface {
  /**
   * Checks if the minimum property is less than or equal to the maximum property.
   *
   * @param value - The current value (not used in this validator).
   * @param args - The validation context including constraint properties and object.
   * @returns `true` if min <= max, otherwise `false`.
   */
  validate(value: unknown, args: ValidationArguments) {
    const object = args.object as T
    const minProperty = args.constraints[0] as keyof T
    const maxProperty = args.constraints[1] as keyof T

    return object[minProperty] <= object[maxProperty]
  }

  /**
   * Builds the default validation error message.
   *
   * @param args - The validation arguments containing constraint keys.
   * @returns A string indicating the min must not exceed max.
   */
  defaultMessage(args: ValidationArguments) {
    const minProperty = args.constraints[0]
    const maxProperty = args.constraints[1]
    return `${minProperty} should not be greater than ${maxProperty}`
  }
}
