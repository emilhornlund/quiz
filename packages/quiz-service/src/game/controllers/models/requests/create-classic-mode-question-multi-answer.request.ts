import { CreateClassicModeQuestionMultiAnswerRequestDto } from '@quiz/common'

import {
  ClassicModeGameQuestionMultiAnswerCorrectProperty,
  ClassicModeGameQuestionMultiAnswerValueProperty,
} from '../../decorators'

export class CreateClassicModeQuestionMultiAnswerRequest
  implements CreateClassicModeQuestionMultiAnswerRequestDto
{
  @ClassicModeGameQuestionMultiAnswerValueProperty()
  value: string

  @ClassicModeGameQuestionMultiAnswerCorrectProperty()
  correct: boolean
}
