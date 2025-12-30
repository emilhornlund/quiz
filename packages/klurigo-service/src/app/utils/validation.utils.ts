import { ValidationError } from '@nestjs/common'

import { ValidationConstraintError } from '../exceptions'

export function reduceNestedValidationErrors(
  errors: ValidationError[],
  parentProperty: string = '',
): ValidationConstraintError[] {
  return errors.reduce<ValidationConstraintError[]>((result, error) => {
    const propertyPath = parentProperty
      ? `${parentProperty}.${error.property}`
      : error.property

    if (error.constraints) {
      result.push({
        property: propertyPath,
        constraints: error.constraints,
      })
    }

    if (error.children && error.children.length > 0) {
      result.push(...reduceNestedValidationErrors(error.children, propertyPath))
    }

    return result
  }, [])
}
