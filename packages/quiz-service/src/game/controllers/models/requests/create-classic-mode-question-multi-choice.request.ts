import {
  CreateClassicModeQuestionMultiChoiceRequestDto,
  QuestionType,
} from '@quiz/common'

import {
  ClassicModeGameQuestionMultiChoiceAnswersArrayProperty,
  GameQuestionDurationProperty,
  GameQuestionMediaProperty,
  GameQuestionPointsProperty,
  GameQuestionTypeProperty,
  GameQuestionValueProperty,
} from '../../decorators'

import { CreateClassicModeQuestionMultiChoiceAnswerRequest } from './create-classic-mode-question-multi-choice-answer.request'
import { CreateCommonMediaRequest } from './create-common-media.request'

export class CreateClassicModeQuestionMultiChoiceRequest
  implements CreateClassicModeQuestionMultiChoiceRequestDto
{
  @GameQuestionTypeProperty(QuestionType.MultiChoice)
  type: QuestionType.MultiChoice

  @GameQuestionValueProperty({ example: 'What is the capital of Sweden?' })
  question: string

  @GameQuestionMediaProperty()
  media?: CreateCommonMediaRequest

  @ClassicModeGameQuestionMultiChoiceAnswersArrayProperty()
  answers: CreateClassicModeQuestionMultiChoiceAnswerRequest[]

  @GameQuestionPointsProperty()
  points: number

  @GameQuestionDurationProperty()
  duration: number
}
