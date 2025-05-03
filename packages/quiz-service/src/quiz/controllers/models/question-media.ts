import { MediaType, QuestionMediaDto } from '@quiz/common'

import {
  ApiQuestionMediaTypeProperty,
  ApiQuestionMediaUrlProperty,
} from '../decorators/api'

/**
 * Represents a data transfer object for a media associated with a question, such as images or videos.
 */
export class QuestionMedia implements QuestionMediaDto {
  /**
   * The type of media (e.g., image, audio, video).
   */
  @ApiQuestionMediaTypeProperty()
  type: MediaType

  /**
   * The URL of the media.
   */
  @ApiQuestionMediaUrlProperty()
  url: string
}
