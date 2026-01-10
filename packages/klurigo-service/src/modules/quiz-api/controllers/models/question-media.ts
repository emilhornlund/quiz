import {
  MediaType,
  QuestionAudioMediaDto,
  QuestionImageMediaDto,
  QuestionImageRevealEffectType,
  QuestionVideoMediaDto,
} from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

import {
  ApiQuestionMediaTypeProperty,
  ApiQuestionMediaUrlProperty,
} from '../decorators/api'

/**
 * Represents an image-based media object associated with a question.
 */
export class QuestionImageMedia implements QuestionImageMediaDto {
  /**
   The type of media, image in this case.
   */
  @ApiQuestionMediaTypeProperty()
  type: MediaType.Image

  /**
   * The URL of the media.
   */
  @ApiQuestionMediaUrlProperty()
  url: string

  /**
   * Optional visual reveal effect applied to the image.
   *
   * Defines how the image should be revealed during the question (e.g., blur, fade).
   */
  @ApiProperty({
    title: 'Image Reveal Effect Type',
    description:
      'Optional visual reveal effect applied to the image (e.g., blur, square).',
    example: QuestionImageRevealEffectType.Blur,
    required: false,
    enum: QuestionImageRevealEffectType,
  })
  @IsOptional()
  @IsEnum(QuestionImageRevealEffectType, {
    message: 'Invalid image reveal effect type.',
  })
  effect?: QuestionImageRevealEffectType
}

/**
 * Represents an audio-based media object associated with a question.
 */
export class QuestionAudioMedia implements QuestionAudioMediaDto {
  /**
   * The type of media, audio in this case.
   */
  @ApiQuestionMediaTypeProperty()
  type: MediaType.Audio

  /**
   * The URL of the media.
   */
  @ApiQuestionMediaUrlProperty()
  url: string
}

/**
 * Represents a video-based media object associated with a question.
 */
export class QuestionVideoMedia implements QuestionVideoMediaDto {
  /**
   The type of media, video in this case.
   */
  @ApiQuestionMediaTypeProperty()
  type: MediaType.Video

  /**
   * The URL of the media.
   */
  @ApiQuestionMediaUrlProperty()
  url: string
}
