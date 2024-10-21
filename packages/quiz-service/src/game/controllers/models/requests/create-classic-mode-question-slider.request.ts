import {
  CreateClassicModeQuestionSliderRequestDto,
  QuestionType,
} from '@quiz/common'

import {
  ClassicModeGameQuestionSliderCorrectProperty,
  ClassicModeGameQuestionSliderMaxProperty,
  ClassicModeGameQuestionSliderMinProperty,
  GameQuestionDurationProperty,
  GameQuestionImageUrlProperty,
  GameQuestionPointsProperty,
  GameQuestionTypeProperty,
  GameQuestionValueProperty,
} from '../../decorators'

export class CreateClassicModeQuestionSliderRequest
  implements CreateClassicModeQuestionSliderRequestDto
{
  @GameQuestionTypeProperty(QuestionType.Slider)
  type: QuestionType.Slider

  @GameQuestionValueProperty({
    example: 'Guess the temperature of the hottest day ever recorded.',
  })
  question: string

  @GameQuestionImageUrlProperty()
  imageURL?: string

  @ClassicModeGameQuestionSliderMinProperty()
  min: number

  @ClassicModeGameQuestionSliderMaxProperty()
  max: number

  @ClassicModeGameQuestionSliderCorrectProperty()
  correct: number

  @GameQuestionPointsProperty()
  points: number

  @GameQuestionDurationProperty()
  duration: number
}
