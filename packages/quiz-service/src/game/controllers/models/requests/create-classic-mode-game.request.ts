import { BadRequestException } from '@nestjs/common'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import {
  CreateClassicModeGameRequestDto,
  GameMode,
  QuestionType,
} from '@quiz/common'
import { plainToInstance, Transform } from 'class-transformer'
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator'

import { GameModeProperty, GameNameProperty } from '../../decorators'

import { CreateClassicModeQuestionMultiChoiceRequest } from './create-classic-mode-question-multi-choice.request'
import { CreateClassicModeQuestionRangeRequest } from './create-classic-mode-question-range.request'
import { CreateClassicModeQuestionTrueFalseRequest } from './create-classic-mode-question-true-false.request'
import { CreateClassicModeQuestionTypeAnswerRequest } from './create-classic-mode-question-type-answer.request'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformQuestionBasedOnType(question: any) {
  switch (question?.type) {
    case QuestionType.MultiChoice:
      return plainToInstance(
        CreateClassicModeQuestionMultiChoiceRequest,
        question,
      )
    case QuestionType.TrueFalse:
      return plainToInstance(
        CreateClassicModeQuestionTrueFalseRequest,
        question,
      )
    case QuestionType.Range:
      return plainToInstance(CreateClassicModeQuestionRangeRequest, question)
    case QuestionType.TypeAnswer:
      return plainToInstance(
        CreateClassicModeQuestionTypeAnswerRequest,
        question,
      )
    default:
      throw new BadRequestException('Validation failed')
  }
}

@ApiExtraModels(
  CreateClassicModeQuestionMultiChoiceRequest,
  CreateClassicModeQuestionTrueFalseRequest,
  CreateClassicModeQuestionRangeRequest,
  CreateClassicModeQuestionTypeAnswerRequest,
)
export class CreateClassicModeGameRequest
  implements CreateClassicModeGameRequestDto
{
  @GameNameProperty({ example: 'Trivia Battle' })
  name: string

  @GameModeProperty(GameMode.Classic)
  mode: GameMode.Classic

  @ApiProperty({
    description:
      'The list of questions to be included in the game. Must include at least one question.',
    required: true,
    minimum: 1,
    oneOf: [
      { $ref: getSchemaPath(CreateClassicModeQuestionMultiChoiceRequest) },
      { $ref: getSchemaPath(CreateClassicModeQuestionTrueFalseRequest) },
      { $ref: getSchemaPath(CreateClassicModeQuestionRangeRequest) },
      { $ref: getSchemaPath(CreateClassicModeQuestionTypeAnswerRequest) },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Transform(({ value }) => value.map(transformQuestionBasedOnType), {
    toClassOnly: true,
  })
  questions: (
    | CreateClassicModeQuestionMultiChoiceRequest
    | CreateClassicModeQuestionTrueFalseRequest
    | CreateClassicModeQuestionRangeRequest
    | CreateClassicModeQuestionTypeAnswerRequest
  )[]
}
