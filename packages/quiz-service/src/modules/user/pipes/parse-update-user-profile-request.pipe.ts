import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import { AuthProvider } from '@quiz/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { ValidationException } from '../../../app/exceptions'
import {
  UpdateGoogleUserProfileRequest,
  UpdateLocalUserProfileRequest,
} from '../controllers/models'

@Injectable()
export class ParseUpdateUserProfileRequestPipe implements PipeTransform<
  Record<string, unknown>,
  Promise<UpdateLocalUserProfileRequest | UpdateGoogleUserProfileRequest>
> {
  async transform(
    value: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata: ArgumentMetadata,
  ): Promise<UpdateLocalUserProfileRequest | UpdateGoogleUserProfileRequest> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let object: any
    if (value['authProvider'] == AuthProvider.Local) {
      object = plainToInstance(UpdateLocalUserProfileRequest, value)
    } else if (value['authProvider'] == AuthProvider.Google) {
      object = plainToInstance(UpdateGoogleUserProfileRequest, value)
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
