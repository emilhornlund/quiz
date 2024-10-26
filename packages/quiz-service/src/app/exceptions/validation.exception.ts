import { BadRequestException, ValidationError } from '@nestjs/common'

export interface ValidationConstraintError {
  property: string
  constraints: {
    [type: string]: string
  }
}

export class ValidationException extends BadRequestException {
  validationErrors: ValidationError[]
  constructor(validationErrors: ValidationError[]) {
    super('Validation failed')
    this.validationErrors = validationErrors
  }
}
