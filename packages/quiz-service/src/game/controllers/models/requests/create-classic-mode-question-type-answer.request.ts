import {
  CreateClassicModeQuestionTypeAnswerRequestDto,
  QuestionType,
} from '@quiz/common'

import {
  ClassicModeGameQuestionTypeAnswerCorrectProperty,
  GameQuestionDurationProperty,
  GameQuestionImageUrlProperty,
  GameQuestionPointsProperty,
  GameQuestionTypeProperty,
  GameQuestionValueProperty,
} from '../../decorators'

export class CreateClassicModeQuestionTypeAnswerRequest
  implements CreateClassicModeQuestionTypeAnswerRequestDto
{
  @GameQuestionTypeProperty(QuestionType.TypeAnswer)
  type: QuestionType.TypeAnswer

  @GameQuestionValueProperty({
    example: 'What is the capital of Sweden?',
  })
  question: string

  @GameQuestionImageUrlProperty()
  imageURL?: string

  @ClassicModeGameQuestionTypeAnswerCorrectProperty()
  correct: string

  @GameQuestionPointsProperty()
  points: number

  @GameQuestionDurationProperty()
  duration: number
}
