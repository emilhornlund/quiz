import { ApiProperty } from '@nestjs/swagger'
import { AuthClientResponseDto } from '@quiz/common'

/**
 * Response object for client authentication.
 */
export class AuthClientResponse implements AuthClientResponseDto {
  /**
   * The unique identifier of the client.
   */
  @ApiProperty({
    title: 'Client ID',
    description: 'The unique identifier of the client.',
    type: String,
    format: 'uuid',
  })
  id: string

  /**
   * The name of the client.
   */
  @ApiProperty({
    title: 'Name',
    description: 'The name of the client.',
    type: String,
    example: 'My iPhone',
  })
  name: string
}
