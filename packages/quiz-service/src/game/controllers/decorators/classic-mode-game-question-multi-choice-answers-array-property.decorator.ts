import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  Validate,
  ValidateNested,
} from 'class-validator'

import { CreateClassicModeQuestionMultiChoiceAnswerRequest } from '../models/requests/create-classic-mode-question-multi-choice-answer.request'

import { AtLeastOneCorrectAnswerValidator } from './at-least-one-correct-answer-validator.decorator'

export function ClassicModeGameQuestionMultiChoiceAnswersArrayProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        'The list of possible answers to the question. Must include between 2 and 6 answers, and at least one must be correct.',
      example: [
        { value: 'Stockholm', correct: true },
        { value: 'Paris', correct: false },
        { value: 'London', correct: false },
        { value: 'Berlin', correct: false },
      ],
      required: true,
      minimum: 2,
      maximum: 6,
      type: [CreateClassicModeQuestionMultiChoiceAnswerRequest],
    }),
    IsArray(),
    ArrayMinSize(2),
    ArrayMaxSize(6),
    ValidateNested({ each: true }),
    Type(() => CreateClassicModeQuestionMultiChoiceAnswerRequest),
    Validate(AtLeastOneCorrectAnswerValidator),
  )
}
