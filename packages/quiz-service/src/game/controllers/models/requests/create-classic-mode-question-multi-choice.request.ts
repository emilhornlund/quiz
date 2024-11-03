import {
  CreateClassicModeQuestionMultiChoiceRequestDto,
  QuestionType,
} from '@quiz/common'

import {
  ClassicModeGameQuestionMultiChoiceAnswersArrayProperty,
  GameQuestionDurationProperty,
  GameQuestionImageUrlProperty,
  GameQuestionPointsProperty,
  GameQuestionTypeProperty,
  GameQuestionValueProperty,
} from '../../decorators'

import { CreateClassicModeQuestionMultiChoiceAnswerRequest } from './create-classic-mode-question-multi-choice-answer.request'

export class CreateClassicModeQuestionMultiChoiceRequest
  implements CreateClassicModeQuestionMultiChoiceRequestDto
{
  @GameQuestionTypeProperty(QuestionType.MultiChoice)
  type: QuestionType.MultiChoice

  @GameQuestionValueProperty({ example: 'What is the capital of Sweden?' })
  question: string

  @GameQuestionImageUrlProperty()
  imageURL?: string

  @ClassicModeGameQuestionMultiChoiceAnswersArrayProperty()
  answers: CreateClassicModeQuestionMultiChoiceAnswerRequest[]

  @GameQuestionPointsProperty()
  points: number

  @GameQuestionDurationProperty()
  duration: number
}
