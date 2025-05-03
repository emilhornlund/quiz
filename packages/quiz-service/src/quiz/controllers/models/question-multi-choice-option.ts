import { QuestionMultiChoiceOptionDto } from '@quiz/common'

import {
  ApiQuestionOptionCorrectProperty,
  QuestionOptionValueProperty,
} from '../decorators/api'

/**
 * Represents a data transfer object for an option for multiple-choice or type-answer questions.
 */
export class QuestionMultiChoiceOption implements QuestionMultiChoiceOptionDto {
  /**
   * The text or value of the option.
   */
  @QuestionOptionValueProperty()
  value: string

  /**
   * Indicates whether this option is correct.
   */
  @ApiQuestionOptionCorrectProperty()
  correct: boolean
}
