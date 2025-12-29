import {
  AuthProvider,
  PLAYER_NICKNAME_MAX_LENGTH,
  PLAYER_NICKNAME_MIN_LENGTH,
  PLAYER_NICKNAME_REGEX,
  UpdateGoogleUserProfileRequestDto,
} from '@klurigo/common'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

/**
 * Represents the request object for updating a Google user’s profile.
 */
export class UpdateGoogleUserProfileRequest implements UpdateGoogleUserProfileRequestDto {
  /**
   * The user’s authentication provider, Google for this request dto.
   */
  @ApiProperty({
    title: 'Authentication Provider',
    description: 'The provider used by the user to authenticate.',
    example: AuthProvider.Google,
    enum: [AuthProvider.Google],
  })
  @IsEnum(AuthProvider)
  authProvider: AuthProvider.Google

  /**
   * The user’s default nickname, if provided.
   */
  @ApiPropertyOptional({
    title: 'Default Nickname',
    description:
      'A nickname chosen by the user, must be 2 to 20 characters long and contain only letters, numbers, or underscores.',
    required: true,
    type: String,
    minLength: PLAYER_NICKNAME_MIN_LENGTH,
    maxLength: PLAYER_NICKNAME_MAX_LENGTH,
    pattern: PLAYER_NICKNAME_REGEX.source,
    example: 'FrostyBear',
  })
  @IsOptional()
  @MinLength(PLAYER_NICKNAME_MIN_LENGTH)
  @MaxLength(PLAYER_NICKNAME_MAX_LENGTH)
  @Matches(PLAYER_NICKNAME_REGEX, {
    message: 'Nickname can only contain letters, numbers, and underscores.',
  })
  readonly defaultNickname?: string
}
