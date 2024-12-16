import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ name: 'minMaxValidator', async: false })
export class MinMaxValidator<T> implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const object = args.object as T
    const minProperty = args.constraints[0] as keyof T
    const maxProperty = args.constraints[1] as keyof T

    return object[minProperty] <= object[maxProperty]
  }

  defaultMessage(args: ValidationArguments) {
    const minProperty = args.constraints[0]
    const maxProperty = args.constraints[1]
    return `${minProperty} should not be greater than ${maxProperty}`
  }
}
