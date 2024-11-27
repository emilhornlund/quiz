import { ApiProperty } from '@nestjs/swagger'
import { AuthRequestDto } from '@quiz/common'
import { IsNotEmpty, IsUUID } from 'class-validator'

/**
 * Request object for client authentication.
 */
export class AuthRequest implements AuthRequestDto {
  /**
   * The unique identifier of the client.
   * - Format: UUID
   */
  @ApiProperty({
    title: 'Client ID',
    description: 'A unique identifier for the client.',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  clientId: string
}
