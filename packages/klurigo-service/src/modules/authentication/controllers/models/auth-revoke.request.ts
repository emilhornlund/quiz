import { AuthRevokeRequestDto } from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsJWT } from 'class-validator'

/**
 * Request object for revoking JWT tokens.
 */
export class AuthRevokeRequest implements AuthRevokeRequestDto {
  /**
   * The refresh token issued previously during login or refresh.
   */
  @ApiProperty({
    title: 'Token',
    description: 'JWT token for revoking.',
    type: String,
    format: 'bearer',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsJWT()
  readonly token: string
}
