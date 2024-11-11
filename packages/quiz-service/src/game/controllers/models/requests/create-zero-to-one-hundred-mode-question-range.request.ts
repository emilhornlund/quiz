import {
  CreateZeroToOneHundredModeQuestionRangeRequestDto,
  QuestionType,
} from '@quiz/common'

import {
  GameQuestionDurationProperty,
  GameQuestionImageUrlProperty,
  GameQuestionTypeProperty,
  GameQuestionValueProperty,
  ZeroToOneHundredModeGameQuestionRangeCorrectProperty,
} from '../../decorators'

export class CreateZeroToOneHundredModeQuestionRangeRequest
  implements CreateZeroToOneHundredModeQuestionRangeRequestDto
{
  @GameQuestionTypeProperty(QuestionType.Range)
  type: QuestionType.Range

  @GameQuestionValueProperty({
    example: 'Estimate the percentage of water on the earth’s surface.',
  })
  question: string

  @GameQuestionImageUrlProperty()
  imageURL?: string

  @ZeroToOneHundredModeGameQuestionRangeCorrectProperty()
  correct: number

  @GameQuestionDurationProperty()
  duration: number
}
