import { ApiExtraModels } from '@nestjs/swagger'
import {
  CreateZeroToOneHundredModeGameRequestDto,
  GameMode,
} from '@quiz/common'

import {
  GameModeProperty,
  GameNameProperty,
  GameQuestionsArrayProperty,
} from '../../decorators'

import { CreateZeroToOneHundredModeQuestionSliderRequest } from './create-zero-to-one-hundred-mode-question-slider.request'

@ApiExtraModels(CreateZeroToOneHundredModeQuestionSliderRequest)
export class CreateZeroToOneHundredModeGameRequest
  implements CreateZeroToOneHundredModeGameRequestDto
{
  @GameNameProperty({ example: 'Range Quiz' })
  name: string

  @GameModeProperty(GameMode.ZeroToOneHundred)
  mode: GameMode.ZeroToOneHundred

  @GameQuestionsArrayProperty({
    oneOf: [CreateZeroToOneHundredModeQuestionSliderRequest],
  })
  questions: CreateZeroToOneHundredModeQuestionSliderRequest[]
}
