import { GameMode } from '@klurigo/common'
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { ValidationException } from '../../../app/exceptions'
import {
  QuizClassicRequest,
  QuizZeroToOneHundredRequest,
} from '../controllers/models'

@Injectable()
export class ParseQuizRequestPipe implements PipeTransform<
  Record<string, unknown>,
  Promise<QuizClassicRequest | QuizZeroToOneHundredRequest>
> {
  async transform(
    value: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata: ArgumentMetadata,
  ): Promise<QuizClassicRequest | QuizZeroToOneHundredRequest> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let object: any
    if (value['mode'] == GameMode.Classic) {
      object = plainToInstance(QuizClassicRequest, value)
    } else if (value['mode'] == GameMode.ZeroToOneHundred) {
      object = plainToInstance(QuizZeroToOneHundredRequest, value)
    } else {
      throw new BadRequestException('Validation failed')
    }
    const errors = await validate(object)
    if (errors.length > 0) {
      throw new ValidationException(errors)
    }
    return object
  }
}
