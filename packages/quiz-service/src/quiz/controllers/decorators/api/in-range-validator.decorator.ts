import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ name: 'inRangeValidator', async: false })
export class InRangeValidator<T> implements ValidatorConstraintInterface {
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

  defaultMessage(args: ValidationArguments) {
    const fieldProperty = args.constraints[0]
    const minProperty = args.constraints[1]
    const maxProperty = args.constraints[2]
    return `${fieldProperty} must be within the range of ${minProperty} and ${maxProperty}`
  }
}
