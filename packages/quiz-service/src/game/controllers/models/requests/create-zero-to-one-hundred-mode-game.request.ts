import { BadRequestException } from '@nestjs/common'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import {
  CreateZeroToOneHundredModeGameRequestDto,
  GameMode,
  QuestionType,
} from '@quiz/common'
import { plainToInstance, Transform } from 'class-transformer'
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator'

import { GameModeProperty, GameNameProperty } from '../../decorators'

import { CreateZeroToOneHundredModeQuestionRangeRequest } from './create-zero-to-one-hundred-mode-question-range.request'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformQuestionBasedOnType(question: any) {
  switch (question?.type) {
    case QuestionType.Range:
      return plainToInstance(
        CreateZeroToOneHundredModeQuestionRangeRequest,
        question,
      )
    default:
      throw new BadRequestException('Validation failed')
  }
}

@ApiExtraModels(CreateZeroToOneHundredModeQuestionRangeRequest)
export class CreateZeroToOneHundredModeGameRequest
  implements CreateZeroToOneHundredModeGameRequestDto
{
  @GameNameProperty({ example: 'Range Quiz' })
  name: string

  @GameModeProperty(GameMode.ZeroToOneHundred)
  mode: GameMode.ZeroToOneHundred

  @ApiProperty({
    description:
      'The list of questions to be included in the game. Must include at least one question.',
    required: true,
    minimum: 1,
    oneOf: [
      {
        $ref: getSchemaPath(CreateZeroToOneHundredModeQuestionRangeRequest),
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Transform(({ value }) => value.map(transformQuestionBasedOnType), {
    toClassOnly: true,
  })
  questions: CreateZeroToOneHundredModeQuestionRangeRequest[]
}
