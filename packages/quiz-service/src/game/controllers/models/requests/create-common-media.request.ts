import { ApiProperty } from '@nestjs/swagger'
import { CreateCommonMediaRequestDto, MediaType } from '@quiz/common'
import { IsEnum, IsUrl } from 'class-validator'

export class CreateCommonMediaRequest implements CreateCommonMediaRequestDto {
  @ApiProperty({
    description:
      'The type of media (image, video, audio) associated with the question.',
    example: MediaType.Image,
    required: true,
    enum: [MediaType],
  })
  @IsEnum(MediaType, { message: 'Invalid media type.' })
  type: MediaType

  @ApiProperty({
    description: 'The URL of the media. Must be a valid URL.',
    example: 'https://example.com/question-image.png',
    required: true,
    format: 'url',
    type: String,
  })
  @IsUrl({}, { message: 'The media URL must be a valid URL.' })
  url: string
}
