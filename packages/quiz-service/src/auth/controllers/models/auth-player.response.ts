import { ApiProperty } from '@nestjs/swagger'
import { AuthPlayerResponseDto } from '@quiz/common'

/**
 * Response object for player authentication.
 */
export class AuthPlayerResponse implements AuthPlayerResponseDto {
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
}
