import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import { GAME_PIN_REGEX } from '@quiz/common'

@Injectable()
export class ParseGamePINPipe implements PipeTransform<string, string> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!GAME_PIN_REGEX.test(value)) {
      throw new BadRequestException('Validation failed')
    }
    return value
  }
}
