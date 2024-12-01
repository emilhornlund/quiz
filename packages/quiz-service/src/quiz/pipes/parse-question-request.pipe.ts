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
  QuestionMultiChoiceRequest,
  QuestionRangeRequest,
  QuestionRequest,
  QuestionTrueFalseRequest,
  QuestionTypeAnswerRequest,
} from '../controllers/models'

/**
 * A pipe for transforming and validating incoming question requests in a NestJS application.
 *
 * The `ParseQuestionRequestPipe` dynamically transforms an incoming raw request object
 * into a specific class instance based on the `type` field, validates it using
 * class-validator, and throws an exception if validation fails.
 */
@Injectable()
export class ParseQuestionRequestPipe
  implements PipeTransform<Record<string, unknown>, Promise<QuestionRequest>>
{
  /**
   * Transforms and validates incoming request data into a specific question DTO.
   *
   * @param {Record<string, unknown>} value - The incoming request data as a key-value object.
   * @param {ArgumentMetadata} metadata - Metadata about the argument being processed (not used in this implementation).
   *
   * @returns {Promise<QuestionRequest>} - A promise resolving to a validated question request DTO.
   *
   * @throws {BadRequestException} - If the `type` field is missing or does not match a valid question type.
   * @throws {ValidationException} - If the transformed DTO fails validation.
   */
  async transform(
    value: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata: ArgumentMetadata,
  ): Promise<QuestionRequest> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let object: any
    if (value['type'] == QuestionType.MultiChoice) {
      object = plainToInstance(QuestionMultiChoiceRequest, value)
    } else if (value['type'] == QuestionType.Range) {
      object = plainToInstance(QuestionRangeRequest, value)
    } else if (value['type'] == QuestionType.TrueFalse) {
      object = plainToInstance(QuestionTrueFalseRequest, value)
    } else if (value['type'] == QuestionType.TypeAnswer) {
      object = plainToInstance(QuestionTypeAnswerRequest, value)
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
