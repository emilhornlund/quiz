import type { QuestionZeroToOneHundredRangeDto } from '@klurigo/common'
import {
  MediaType,
  QuestionType,
  QUIZ_DURATION_ALLOWED,
  QUIZ_QUESTION_INFO_MAX_LENGTH,
  QUIZ_QUESTION_INFO_MIN_LENGTH,
  QUIZ_QUESTION_INFO_REGEX,
  QUIZ_QUESTION_TEXT_MAX_LENGTH,
  QUIZ_QUESTION_TEXT_MIN_LENGTH,
  QUIZ_QUESTION_TEXT_REGEX,
  URL_REGEX,
} from '@klurigo/common'

import { defineRules } from '../../../validation'

/**
 * Validation rules for ZeroToOneHundred mode Range questions.
 *
 * Validates:
 * - Discriminator type is `QuestionType.Range`
 * - Question text format and length
 * - Optional media with supported media type and URL format
 * - Correct answer is an integer in range [0..100]
 * - Duration restricted to allowed constants
 * - Optional info text format and length
 */
export const zeroToOneHundredRangeRules =
  defineRules<QuestionZeroToOneHundredRangeDto>()({
    optionalKeys: ['media', 'info'] as const,
  })({
    type: {
      kind: 'string',
      oneOf: [QuestionType.Range] as const,
    },

    question: {
      kind: 'string',
      minLength: QUIZ_QUESTION_TEXT_MIN_LENGTH,
      maxLength: QUIZ_QUESTION_TEXT_MAX_LENGTH,
      regex: QUIZ_QUESTION_TEXT_REGEX,
    },

    media: {
      kind: 'object',
      shape: {
        type: {
          kind: 'string',
          oneOf: [MediaType.Image, MediaType.Video, MediaType.Audio] as const,
        },
        url: {
          kind: 'string',
          regex: URL_REGEX,
        },
      },
    },

    correct: {
      kind: 'number',
      integer: true,
      min: 0,
      max: 100,
    },

    duration: {
      kind: 'number',
      integer: true,
      oneOf: QUIZ_DURATION_ALLOWED,
    },

    info: {
      kind: 'string',
      minLength: QUIZ_QUESTION_INFO_MIN_LENGTH,
      maxLength: QUIZ_QUESTION_INFO_MAX_LENGTH,
      regex: QUIZ_QUESTION_INFO_REGEX,
    },
  })
