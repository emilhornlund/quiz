import {
  CreateZeroToOneHundredModeQuestionRangeRequestDto,
  QuestionType,
} from '@quiz/common'

import {
  GameQuestionDurationProperty,
  GameQuestionMediaProperty,
  GameQuestionTypeProperty,
  GameQuestionValueProperty,
  ZeroToOneHundredModeGameQuestionRangeCorrectProperty,
} from '../../decorators'

import { CreateCommonMediaRequest } from './create-common-media.request'

export class CreateZeroToOneHundredModeQuestionRangeRequest
  implements CreateZeroToOneHundredModeQuestionRangeRequestDto
{
  @GameQuestionTypeProperty(QuestionType.Range)
  type: QuestionType.Range

  @GameQuestionValueProperty({
    example: 'Estimate the percentage of water on the earth’s surface.',
  })
  question: string

  @GameQuestionMediaProperty()
  media?: CreateCommonMediaRequest

  @ZeroToOneHundredModeGameQuestionRangeCorrectProperty()
  correct: number

  @GameQuestionDurationProperty()
  duration: number
}
