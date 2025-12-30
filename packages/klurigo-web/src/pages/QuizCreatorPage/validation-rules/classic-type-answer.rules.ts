import type { QuestionTypeAnswerDto } from '@klurigo/common'
import {
  MediaType,
  QuestionType,
  QUIZ_DURATION_ALLOWED,
  QUIZ_POINTS_ALLOWED,
  QUIZ_QUESTION_INFO_MAX_LENGTH,
  QUIZ_QUESTION_INFO_MIN_LENGTH,
  QUIZ_QUESTION_INFO_REGEX,
  QUIZ_QUESTION_TEXT_MAX_LENGTH,
  QUIZ_QUESTION_TEXT_MIN_LENGTH,
  QUIZ_QUESTION_TEXT_REGEX,
  QUIZ_TYPE_ANSWER_OPTIONS_MAX,
  QUIZ_TYPE_ANSWER_OPTIONS_MIN,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX_LENGTH,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN_LENGTH,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_REGEX,
  URL_REGEX,
} from '@klurigo/common'

import { defineRules } from '../../../validation'

/**
 * Validation rules for Classic mode TypeAnswer questions.
 *
 * Validates:
 * - Discriminator type is `QuestionType.TypeAnswer`
 * - Question text format and length
 * - Optional media with supported media type and URL format
 * - Options list size and option value format/length
 * - Points and duration restricted to allowed constants
 * - Optional info text format and length
 */
export const classicTypeAnswerRules = defineRules<QuestionTypeAnswerDto>()({
  optionalKeys: ['media', 'info'] as const,
})({
  type: {
    kind: 'string',
    oneOf: [QuestionType.TypeAnswer] as const,
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

  options: {
    kind: 'array',
    minItems: QUIZ_TYPE_ANSWER_OPTIONS_MIN,
    maxItems: QUIZ_TYPE_ANSWER_OPTIONS_MAX,
    element: {
      kind: 'string',
      minLength: QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN_LENGTH,
      maxLength: QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX_LENGTH,
      regex: QUIZ_TYPE_ANSWER_OPTIONS_VALUE_REGEX,
    },
  },

  points: {
    kind: 'number',
    integer: true,
    oneOf: QUIZ_POINTS_ALLOWED,
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
