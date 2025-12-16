import { ApiProperty } from '@nestjs/swagger'
import { AuthRefreshRequestDto } from '@quiz/common'
import { IsJWT } from 'class-validator'

/**
 * Request object for refreshing JWT tokens.
 */
export class AuthRefreshRequest implements AuthRefreshRequestDto {
  /**
   * The refresh token issued previously during login or refresh.
   */
  @ApiProperty({
    title: 'Refresh Token',
    description: 'JWT refresh token for issuing a new access token.',
    type: String,
    format: 'bearer',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsJWT()
  readonly refreshToken: string
}
