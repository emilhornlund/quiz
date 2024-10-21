import { ApiExtraModels } from '@nestjs/swagger'
import { CreateClassicModeGameRequestDto, GameMode } from '@quiz/common'

import {
  GameModeProperty,
  GameNameProperty,
  GameQuestionsArrayProperty,
} from '../../decorators'

import { CreateClassicModeQuestionMultiRequest } from './create-classic-mode-question-multi.request'
import { CreateClassicModeQuestionSliderRequest } from './create-classic-mode-question-slider.request'
import { CreateClassicModeQuestionTrueFalseRequest } from './create-classic-mode-question-true-false.request'
import { CreateClassicModeQuestionTypeAnswerRequest } from './create-classic-mode-question-type-answer.request'

@ApiExtraModels(
  CreateClassicModeQuestionMultiRequest,
  CreateClassicModeQuestionTrueFalseRequest,
  CreateClassicModeQuestionSliderRequest,
  CreateClassicModeQuestionTypeAnswerRequest,
)
export class CreateClassicModeGameRequest
  implements CreateClassicModeGameRequestDto
{
  @GameNameProperty({ example: 'Trivia Battle' })
  name: string

  @GameModeProperty(GameMode.Classic)
  mode: GameMode.Classic

  @GameQuestionsArrayProperty({
    oneOf: [
      CreateClassicModeQuestionMultiRequest,
      CreateClassicModeQuestionTrueFalseRequest,
      CreateClassicModeQuestionSliderRequest,
      CreateClassicModeQuestionTypeAnswerRequest,
    ],
  })
  questions: (
    | CreateClassicModeQuestionMultiRequest
    | CreateClassicModeQuestionTrueFalseRequest
    | CreateClassicModeQuestionSliderRequest
    | CreateClassicModeQuestionTypeAnswerRequest
  )[]
}
