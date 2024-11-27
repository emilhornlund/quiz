import { ApiProperty } from '@nestjs/swagger'
import { AuthResponseDto } from '@quiz/common'

/**
 * Response object for client authentication.
 */
export class AuthResponse implements AuthResponseDto {
  /**
   * JWT token generated for the authenticated client.
   * - Format: Bearer token
   */
  @ApiProperty({
    title: 'Token',
    description: 'JWT token issued to the client for authenticated requests.',
    type: String,
    format: 'bearer',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string
}
