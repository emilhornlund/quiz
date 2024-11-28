import { ApiProperty } from '@nestjs/swagger'
import { PlayerResponseDto } from '@quiz/common'

/**
 * Represents the response object for a player.
 */
export class PlayerResponse implements PlayerResponseDto {
  /**
   * The unique identifier of the player.
   */
  @ApiProperty({
    title: 'Player ID',
    description: 'The unique identifier of the player.',
    type: String,
    format: 'uuid',
  })
  id: string

  /**
   * The nickname of the player.
   */
  @ApiProperty({
    title: 'Nickname',
    description: 'The nickname of the player.',
    type: String,
    example: 'FrostyBear',
  })
  nickname: string

  /**
   * The date and time when the player was created.
   */
  @ApiProperty({
    title: 'Created',
    description: 'The date and time when the player was created.',
    type: Date,
  })
  created: Date

  /**
   * The date and time when the player record was last modified.
   */
  @ApiProperty({
    title: 'Modified',
    description: 'The date and time when the player record was last modified.',
    type: Date,
  })
  modified: Date
}
