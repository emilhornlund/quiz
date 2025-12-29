import { AuthResponseDto } from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'

/**
 * Response object for successful login.
 */
export class AuthResponse implements AuthResponseDto {
  /**
   * JWT access token for use in protected requests.
   */
  @ApiProperty({
    title: 'Access Token',
    description: 'Short-lived JWT for API authentication.',
    type: String,
    format: 'bearer',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  readonly accessToken: string

  /**
   * JWT refresh token to obtain new access tokens.
   */
  @ApiProperty({
    title: 'Refresh Token',
    description: 'Long-lived JWT used to refresh the access token.',
    type: String,
    format: 'bearer',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  readonly refreshToken: string
}
