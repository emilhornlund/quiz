import {
  CreateZeroToOneHundredModeQuestionSliderRequestDto,
  QuestionType,
} from '@quiz/common'

import {
  GameQuestionDurationProperty,
  GameQuestionImageUrlProperty,
  GameQuestionPointsProperty,
  GameQuestionTypeProperty,
  GameQuestionValueProperty,
  ZeroToOneHundredModeGameQuestionSliderCorrectProperty,
} from '../../decorators'

export class CreateZeroToOneHundredModeQuestionSliderRequest
  implements CreateZeroToOneHundredModeQuestionSliderRequestDto
{
  @GameQuestionTypeProperty(QuestionType.Slider)
  type: QuestionType.Slider

  @GameQuestionValueProperty({
    example: 'Estimate the percentage of water on the earth’s surface.',
  })
  question: string

  @GameQuestionImageUrlProperty()
  imageURL?: string

  @ZeroToOneHundredModeGameQuestionSliderCorrectProperty()
  correct: number

  @GameQuestionPointsProperty()
  points: number

  @GameQuestionDurationProperty()
  duration: number
}
