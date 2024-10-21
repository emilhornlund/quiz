import {
  CreateClassicModeQuestionMultiRequestDto,
  QuestionType,
} from '@quiz/common'

import {
  ClassicModeGameQuestionMultiAnswersArrayProperty,
  GameQuestionDurationProperty,
  GameQuestionImageUrlProperty,
  GameQuestionPointsProperty,
  GameQuestionTypeProperty,
  GameQuestionValueProperty,
} from '../../decorators'

import { CreateClassicModeQuestionMultiAnswerRequest } from './create-classic-mode-question-multi-answer.request'

export class CreateClassicModeQuestionMultiRequest
  implements CreateClassicModeQuestionMultiRequestDto
{
  @GameQuestionTypeProperty(QuestionType.Multi)
  type: QuestionType.Multi

  @GameQuestionValueProperty({ example: 'What is the capital of Sweden?' })
  question: string

  @GameQuestionImageUrlProperty()
  imageURL?: string

  @ClassicModeGameQuestionMultiAnswersArrayProperty()
  answers: CreateClassicModeQuestionMultiAnswerRequest[]

  @GameQuestionPointsProperty()
  points: number

  @GameQuestionDurationProperty()
  duration: number
}
