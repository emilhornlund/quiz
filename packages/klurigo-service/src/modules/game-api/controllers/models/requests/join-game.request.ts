import {
  JoinGameRequestDto,
  PLAYER_NICKNAME_MAX_LENGTH,
  PLAYER_NICKNAME_MIN_LENGTH,
  PLAYER_NICKNAME_REGEX,
} from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class JoinGameRequest implements JoinGameRequestDto {
  @ApiProperty({
    title: 'Nickname',
    description:
      'A nickname chosen by the player, must be 2 to 20 characters long and contain only letters, numbers, or underscores.',
    required: true,
    type: String,
    minLength: PLAYER_NICKNAME_MIN_LENGTH,
    maxLength: PLAYER_NICKNAME_MAX_LENGTH,
    pattern: `${PLAYER_NICKNAME_REGEX}`,
    example: 'FrostyBear',
  })
  @IsString()
  @MinLength(PLAYER_NICKNAME_MIN_LENGTH)
  @MaxLength(PLAYER_NICKNAME_MAX_LENGTH)
  @Matches(PLAYER_NICKNAME_REGEX, {
    message: 'Nickname can only contain letters, numbers, and underscores.',
  })
  nickname: string
}
