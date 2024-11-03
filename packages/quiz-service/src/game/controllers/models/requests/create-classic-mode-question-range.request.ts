import {
  CreateClassicModeQuestionSliderRequestDto,
  QuestionType,
} from '@quiz/common'

import {
  ClassicModeGameQuestionRangeCorrectProperty,
  ClassicModeGameQuestionRangeMaxProperty,
  ClassicModeGameQuestionRangeMinProperty,
  GameQuestionDurationProperty,
  GameQuestionImageUrlProperty,
  GameQuestionPointsProperty,
  GameQuestionTypeProperty,
  GameQuestionValueProperty,
} from '../../decorators'

export class CreateClassicModeQuestionRangeRequest
  implements CreateClassicModeQuestionSliderRequestDto
{
  @GameQuestionTypeProperty(QuestionType.Range)
  type: QuestionType.Range

  @GameQuestionValueProperty({
    example: 'Guess the temperature of the hottest day ever recorded.',
  })
  question: string

  @GameQuestionImageUrlProperty()
  imageURL?: string

  @ClassicModeGameQuestionRangeMinProperty()
  min: number

  @ClassicModeGameQuestionRangeMaxProperty()
  max: number

  @ClassicModeGameQuestionRangeCorrectProperty()
  correct: number

  @GameQuestionPointsProperty()
  points: number

  @GameQuestionDurationProperty()
  duration: number
}
