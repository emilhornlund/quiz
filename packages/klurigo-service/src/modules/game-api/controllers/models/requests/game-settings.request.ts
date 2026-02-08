import { GameSettingsDto } from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

/**
 * Request body for updating runtime settings for an existing game.
 *
 * The settings are persisted on the game instance and do not modify the quiz definition.
 */
export class GameSettingsRequest implements GameSettingsDto {
  /**
   * Whether to randomize the order of questions when the game starts.
   */
  @ApiProperty({
    title: 'Randomize Question Order',
    description:
      'When enabled, questions are shuffled before the first round begins. This does not modify the underlying quiz.',
    required: true,
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  randomizeQuestionOrder: boolean

  /**
   * Whether to randomize the order of answer options for each question.
   */
  @ApiProperty({
    title: 'Randomize Answer Order',
    description:
      'When enabled, the answer alternatives for each question are shuffled before being presented. This does not modify the underlying quiz.',
    required: true,
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  randomizeAnswerOrder: boolean
}
