import { ApiProperty } from '@nestjs/swagger'
import {
  MultiChoiceQuestionCorrectAnswerDto,
  QuestionType,
  QUIZ_MULTI_CHOICE_OPTIONS_MAX,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN,
  RangeQuestionCorrectAnswerDto,
  TrueFalseQuestionCorrectAnswerDto,
  TypeAnswerQuestionCorrectAnswerDto,
} from '@quiz/common'
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

import { ApiQuestionTypeProperty } from '../../../../quiz/controllers/decorators/api'

/**
 * Request model for submitting a correct answer to a MultiChoice question.
 *
 * Includes the `type` identifier and the correct `index` in the options array.
 */
export class MultiChoiceQuestionCorrectAnswerRequest
  implements MultiChoiceQuestionCorrectAnswerDto
{
  /**
   * The type of the question, set to `MultiChoice`.
   */
  @ApiQuestionTypeProperty({
    description: `The type of the question, which is set to ${QuestionType.MultiChoice} for this request.`,
    explicitType: QuestionType.MultiChoice,
  })
  type: QuestionType.MultiChoice

  @ApiProperty({
    title: 'Index',
    description: 'The correct index for the multi-choice answer.',
    required: true,
    minimum: 0,
    maximum: QUIZ_MULTI_CHOICE_OPTIONS_MAX - 1,
    type: Number,
    example: 0,
  })
  @IsInt()
  @Min(0)
  @Max(QUIZ_MULTI_CHOICE_OPTIONS_MAX - 1)
  index: number
}

/**
 * Request model for submitting a correct answer to a Range question.
 *
 * Includes the `type` identifier and the correct numeric `value`.
 */
export class RangeQuestionCorrectAnswerRequest
  implements RangeQuestionCorrectAnswerDto
{
  /**
   * The type of the question, set to `Range`.
   */
  @ApiQuestionTypeProperty({
    description: `The type of the question, which is set to ${QuestionType.Range} for this request.`,
    explicitType: QuestionType.Range,
  })
  type: QuestionType.Range

  @ApiProperty({
    title: 'Value',
    description: 'The correct value for the range answer.',
    required: true,
    minimum: -10000,
    maximum: 10000,
    type: Number,
    example: 50,
  })
  @IsNumber()
  @Min(-10000)
  @Max(10000)
  value: number
}

/**
 * Request model for submitting a correct answer to a True/False question.
 *
 * Includes the `type` identifier and the boolean `value` representing the correct answer.
 */
export class TrueFalseQuestionCorrectAnswerRequest
  implements TrueFalseQuestionCorrectAnswerDto
{
  /**
   * The type of the question, set to `TrueFalse`.
   */
  @ApiQuestionTypeProperty({
    description: `The type of the question, which is set to ${QuestionType.TrueFalse} for this request.`,
    explicitType: QuestionType.TrueFalse,
  })
  type: QuestionType.TrueFalse

  @ApiProperty({
    title: 'Value',
    description: 'The correct value for the true-false answer.',
    required: true,
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  value: boolean
}

/**
 * Request model for submitting a correct answer to a TypeAnswer question.
 *
 * Includes the `type` identifier and the string `value` that should be accepted as correct.
 */
export class TypeAnswerQuestionCorrectAnswerRequest
  implements TypeAnswerQuestionCorrectAnswerDto
{
  /**
   * The type of the question, set to `TypeAnswer`.
   */
  @ApiQuestionTypeProperty({
    description: `The type of the question, which is set to ${QuestionType.TypeAnswer} for this request.`,
    explicitType: QuestionType.TypeAnswer,
  })
  type: QuestionType.TypeAnswer

  @ApiProperty({
    title: 'Value',
    description: 'The correct value for the type-answer.',
    example: 'Stockholm',
    required: true,
    minLength: QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN,
    maxLength: QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX,
    type: String,
  })
  @IsString()
  @MinLength(QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN)
  @MaxLength(QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX)
  value: string
}
