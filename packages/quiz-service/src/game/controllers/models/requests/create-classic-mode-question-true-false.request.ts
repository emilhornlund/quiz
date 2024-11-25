import {
  CreateClassicModeQuestionTrueFalseRequestDto,
  QuestionType,
} from '@quiz/common'

import {
  ClassicModeGameQuestionTrueFalseCorrectProperty,
  GameQuestionDurationProperty,
  GameQuestionMediaProperty,
  GameQuestionPointsProperty,
  GameQuestionTypeProperty,
  GameQuestionValueProperty,
} from '../../decorators'

import { CreateCommonMediaRequest } from './create-common-media.request'

export class CreateClassicModeQuestionTrueFalseRequest
  implements CreateClassicModeQuestionTrueFalseRequestDto
{
  @GameQuestionTypeProperty(QuestionType.TrueFalse)
  type: QuestionType.TrueFalse

  @GameQuestionValueProperty({
    example: 'The earth is flat.',
  })
  question: string

  @GameQuestionMediaProperty()
  media?: CreateCommonMediaRequest

  @ClassicModeGameQuestionTrueFalseCorrectProperty()
  correct: boolean

  @GameQuestionPointsProperty()
  points: number

  @GameQuestionDurationProperty()
  duration: number
}
