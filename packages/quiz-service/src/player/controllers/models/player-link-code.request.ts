import { ApiProperty } from '@nestjs/swagger'
import { PLAYER_LINK_CODE_REGEX, PlayerLinkCodeRequestDto } from '@quiz/common'
import { IsNotEmpty, Matches } from 'class-validator'

/**
 * DTO for the player link code request.
 * This is used to send the link code in the request to associate a player.
 */
export class PlayerLinkCodeRequest implements PlayerLinkCodeRequestDto {
  /**
   * The link code to associate a player with the authenticated client.
   * The code must match the pattern of 4 alphanumeric characters, followed by a hyphen, and another 4 alphanumeric characters.
   */
  @ApiProperty({
    description: 'The link code to associate a player.',
    required: true,
    type: String,
    pattern: `${PLAYER_LINK_CODE_REGEX}`,
    example: 'XXXX-XXXX',
  })
  @IsNotEmpty()
  @Matches(PLAYER_LINK_CODE_REGEX, {
    message: `The code must match the pattern ${PLAYER_LINK_CODE_REGEX}`,
  })
  code: string
}
