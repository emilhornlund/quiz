import { GameSettingsDto } from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'

/**
 * Response body containing the persisted runtime settings for a game.
 */
export class GameSettingsResponse implements GameSettingsDto {
  /**
   * Whether the game randomizes the question order when the game starts.
   */
  @ApiProperty({
    title: 'Randomize Question Order',
    description:
      'When enabled, questions are shuffled before the first round begins. This does not modify the underlying quiz.',
    required: true,
    type: Boolean,
    example: true,
  })
  randomizeQuestionOrder: boolean

  /**
   * Whether the game randomizes the order of answer options for each question.
   */
  @ApiProperty({
    title: 'Randomize Answer Order',
    description:
      'When enabled, the answer alternatives for each question are shuffled before being presented. This does not modify the underlying quiz.',
    required: true,
    type: Boolean,
    example: true,
  })
  randomizeAnswerOrder: boolean
}
