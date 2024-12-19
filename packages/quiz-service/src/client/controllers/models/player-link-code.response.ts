import { ApiProperty } from '@nestjs/swagger'
import { PLAYER_LINK_CODE_REGEX, PlayerLinkCodeResponseDto } from '@quiz/common'

/**
 * DTO for the response containing the player link code.
 * This response includes the generated link code and its expiration time.
 */
export class PlayerLinkCodeResponse implements PlayerLinkCodeResponseDto {
  /**
   * The generated player link code.
   * The code is a unique identifier that the client uses to associate a player.
   */
  @ApiProperty({
    description: 'The generated player link code.',
    required: true,
    type: String,
    pattern: `${PLAYER_LINK_CODE_REGEX}`,
    example: 'XXXX-XXXX',
  })
  code: string

  /**
   * The expiration date and time of the link code.
   * The link code expires after a certain period of time.
   */
  @ApiProperty({
    description: 'The expiration date and time of the link code.',
    required: true,
    type: Date,
    format: 'date-time',
  })
  expires: Date
}
