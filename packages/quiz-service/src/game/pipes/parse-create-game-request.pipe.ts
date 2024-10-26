import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import { GameMode } from '@quiz/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { ValidationException } from '../../app/exceptions'
import {
  CreateClassicModeGameRequest,
  CreateZeroToOneHundredModeGameRequest,
} from '../controllers/models/requests'

@Injectable()
export class ParseCreateGameRequestPipe
  implements
    PipeTransform<
      Record<string, unknown>,
      Promise<
        CreateClassicModeGameRequest | CreateZeroToOneHundredModeGameRequest
      >
    >
{
  async transform(
    value: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata: ArgumentMetadata,
  ): Promise<
    CreateClassicModeGameRequest | CreateZeroToOneHundredModeGameRequest
  > {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let object: any
    if (value['mode'] == GameMode.Classic) {
      object = plainToInstance(CreateClassicModeGameRequest, value)
    } else if (value['mode'] == GameMode.ZeroToOneHundred) {
      object = plainToInstance(CreateZeroToOneHundredModeGameRequest, value)
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
