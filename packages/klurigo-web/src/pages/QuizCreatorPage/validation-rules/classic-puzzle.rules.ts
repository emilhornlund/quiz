import type { QuestionPuzzleDto } from '@klurigo/common'
import {
  MediaType,
  QuestionType,
  QUIZ_DURATION_ALLOWED,
  QUIZ_POINTS_ALLOWED,
  QUIZ_PUZZLE_VALUE_MAX_LENGTH,
  QUIZ_PUZZLE_VALUE_MIN_LENGTH,
  QUIZ_PUZZLE_VALUE_REGEX,
  QUIZ_PUZZLE_VALUES_MAX,
  QUIZ_PUZZLE_VALUES_MIN,
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
 * Validation rules for Classic mode Puzzle questions.
 *
 * Validates:
 * - Discriminator type is `QuestionType.Puzzle`
 * - Question text format and length
 * - Optional media with supported media type and URL format
 * - Puzzle values list size and value format/length
 * - Points and duration restricted to allowed constants
 * - Optional info text format and length
 */
export const classicPuzzleRules = defineRules<QuestionPuzzleDto>()({
  optionalKeys: ['media', 'info'] as const,
})({
  type: {
    kind: 'string',
    oneOf: [QuestionType.Puzzle] as const,
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

  values: {
    kind: 'array',
    minItems: QUIZ_PUZZLE_VALUES_MIN,
    maxItems: QUIZ_PUZZLE_VALUES_MAX,
    element: {
      kind: 'string',
      minLength: QUIZ_PUZZLE_VALUE_MIN_LENGTH,
      maxLength: QUIZ_PUZZLE_VALUE_MAX_LENGTH,
      regex: QUIZ_PUZZLE_VALUE_REGEX,
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
