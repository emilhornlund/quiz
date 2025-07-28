import { InternalServerErrorException } from '@nestjs/common'

import { TaskType } from '../repositories/models/schemas'

export class IllegalTaskTypeException extends InternalServerErrorException {
  constructor(actual: TaskType, expected: TaskType) {
    super(`Illegal task type ${actual}, expected ${expected}`)
  }
}
