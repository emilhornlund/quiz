import {
  CreateClassicModeQuestionTypeAnswerRequestDto,
  QuestionType,
} from '@quiz/common'

import {
  ClassicModeGameQuestionTypeAnswerCorrectProperty,
  GameQuestionDurationProperty,
  GameQuestionMediaProperty,
  GameQuestionPointsProperty,
  GameQuestionTypeProperty,
  GameQuestionValueProperty,
} from '../../decorators'

import { CreateCommonMediaRequest } from './create-common-media.request'

export class CreateClassicModeQuestionTypeAnswerRequest
  implements CreateClassicModeQuestionTypeAnswerRequestDto
{
  @GameQuestionTypeProperty(QuestionType.TypeAnswer)
  type: QuestionType.TypeAnswer

  @GameQuestionValueProperty({
    example: 'What is the capital of Sweden?',
  })
  question: string

  @GameQuestionMediaProperty()
  media?: CreateCommonMediaRequest

  @ClassicModeGameQuestionTypeAnswerCorrectProperty()
  correct: string

  @GameQuestionPointsProperty()
  points: number

  @GameQuestionDurationProperty()
  duration: number
}
