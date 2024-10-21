import {
  CreateClassicModeQuestionTrueFalseRequestDto,
  QuestionType,
} from '@quiz/common'

import {
  ClassicModeGameQuestionTrueFalseCorrectProperty,
  GameQuestionDurationProperty,
  GameQuestionImageUrlProperty,
  GameQuestionPointsProperty,
  GameQuestionTypeProperty,
  GameQuestionValueProperty,
} from '../../decorators'

export class CreateClassicModeQuestionTrueFalseRequest
  implements CreateClassicModeQuestionTrueFalseRequestDto
{
  @GameQuestionTypeProperty(QuestionType.TrueFalse)
  type: QuestionType.TrueFalse

  @GameQuestionValueProperty({
    example: 'The earth is flat.',
  })
  question: string

  @GameQuestionImageUrlProperty()
  imageURL?: string

  @ClassicModeGameQuestionTrueFalseCorrectProperty()
  correct: boolean

  @GameQuestionPointsProperty()
  points: number

  @GameQuestionDurationProperty()
  duration: number
}
