import { BadRequestException, ValidationError } from '@nestjs/common'

export class ValidationException extends BadRequestException {
  validationErrors: ValidationError[]
  constructor(errors: ValidationError[]) {
    super('Validation failed')
    this.validationErrors = errors
  }
}
