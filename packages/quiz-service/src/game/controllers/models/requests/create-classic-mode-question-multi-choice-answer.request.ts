import { CreateClassicModeQuestionMultiChoiceAnswerRequestDto } from '@quiz/common'

import {
  ClassicModeGameQuestionMultiChoiceAnswerCorrectProperty,
  ClassicModeGameQuestionMultiChoiceAnswerValueProperty,
} from '../../decorators'

export class CreateClassicModeQuestionMultiChoiceAnswerRequest
  implements CreateClassicModeQuestionMultiChoiceAnswerRequestDto
{
  @ClassicModeGameQuestionMultiChoiceAnswerValueProperty()
  value: string

  @ClassicModeGameQuestionMultiChoiceAnswerCorrectProperty()
  correct: boolean
}
