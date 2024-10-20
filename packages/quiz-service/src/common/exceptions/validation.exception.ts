import { BadRequestException, ValidationError } from '@nestjs/common'

export interface ValidationConstraintError {
  property: string
  constraints: {
    [type: string]: string
  }
}

export class ValidationException extends BadRequestException {
  validationErrors: ValidationError[]
  constructor(errors: ValidationError[]) {
    super('Validation failed')
    this.validationErrors = errors
  }
}
