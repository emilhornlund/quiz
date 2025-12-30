import {
  AuthGameRequestDto,
  GAME_PIN_LENGTH,
  GAME_PIN_REGEX,
} from '@klurigo/common'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsUUID, Matches, ValidateIf } from 'class-validator'

/**
 * Request object for game authentication.
 */
export class AuthGameRequest implements AuthGameRequestDto {
  /**
   * The unique identifier of the game to authenticate.
   */
  @ApiPropertyOptional({
    title: 'Game Id',
    description: 'The unique identifier of the game to authenticate.',
    format: 'uuid',
    type: String,
  })
  @ValidateIf((target) => !target.gamePIN || target.gameId)
  @IsUUID()
  readonly gameId?: string

  /**
   * The unique 6-digit game PIN of the game to authenticate.
   */
  @ApiPropertyOptional({
    title: 'Game PIN',
    description: 'The unique 6-digit game PIN of the game to authenticate.',
    pattern: GAME_PIN_REGEX.source,
    minLength: GAME_PIN_LENGTH,
    maxLength: GAME_PIN_LENGTH,
    type: String,
    example: '123456',
  })
  @ValidateIf((target) => !target.gameId || target.gamePIN)
  @Matches(GAME_PIN_REGEX, {
    message: 'gamePIN must be a valid game PIN.',
  })
  readonly gamePIN?: string
}
