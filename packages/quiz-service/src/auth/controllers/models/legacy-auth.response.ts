import { ApiProperty } from '@nestjs/swagger'
import { LegacyAuthResponseDto } from '@quiz/common'

import { LegacyAuthClientResponse } from './legacy-auth-client.response'
import { LegacyAuthPlayerResponse } from './legacy-auth-player.response'

/**
 * Response object for client authentication.
 */
export class LegacyAuthResponse implements LegacyAuthResponseDto {
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

  /**
   * Response object for client authentication.
   */
  @ApiProperty()
  client: LegacyAuthClientResponse

  /**
   * Response object for player authentication.
   */
  @ApiProperty()
  player: LegacyAuthPlayerResponse
}
