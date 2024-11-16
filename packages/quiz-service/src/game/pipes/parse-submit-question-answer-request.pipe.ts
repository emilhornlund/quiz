import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import { QuestionType } from '@quiz/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { ValidationException } from '../../app/exceptions'
import {
  SubmitMultiChoiceQuestionAnswerRequest,
  SubmitRangeQuestionAnswerRequest,
  SubmitTrueFalseQuestionAnswerRequest,
  SubmitTypeAnswerQuestionAnswerRequest,
} from '../controllers/models/requests'

@Injectable()
export class ParseSubmitQuestionAnswerRequestPipe
  implements
    PipeTransform<
      Record<string, unknown>,
      Promise<
        | SubmitMultiChoiceQuestionAnswerRequest
        | SubmitRangeQuestionAnswerRequest
        | SubmitTrueFalseQuestionAnswerRequest
        | SubmitTypeAnswerQuestionAnswerRequest
      >
    >
{
  async transform(
    value: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata: ArgumentMetadata,
  ): Promise<
    | SubmitMultiChoiceQuestionAnswerRequest
    | SubmitRangeQuestionAnswerRequest
    | SubmitTrueFalseQuestionAnswerRequest
    | SubmitTypeAnswerQuestionAnswerRequest
  > {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let object: any
    if (value['type'] == QuestionType.MultiChoice) {
      object = plainToInstance(SubmitMultiChoiceQuestionAnswerRequest, value)
    } else if (value['type'] == QuestionType.Range) {
      object = plainToInstance(SubmitRangeQuestionAnswerRequest, value)
    } else if (value['type'] == QuestionType.TrueFalse) {
      object = plainToInstance(SubmitTrueFalseQuestionAnswerRequest, value)
    } else if (value['type'] == QuestionType.TypeAnswer) {
      object = plainToInstance(SubmitTypeAnswerQuestionAnswerRequest, value)
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
