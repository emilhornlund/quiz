import type { QuestionPinDto } from '@klurigo/common'
import {
  QuestionPinTolerance,
  QuestionType,
  QUIZ_DURATION_ALLOWED,
  QUIZ_POINTS_ALLOWED,
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
 * Validation rules for Classic mode Pin questions.
 *
 * Validates:
 * - Discriminator type is `QuestionType.Pin`
 * - Question text format and length
 * - Image URL format
 * - Pin position coordinates are normalized in range [0..1]
 * - Tolerance is one of the supported tolerance levels
 * - Points and duration restricted to allowed constants
 * - Optional info text format and length
 */
export const classicPinRules = defineRules<QuestionPinDto>()({
  optionalKeys: ['info'] as const,
})({
  type: {
    kind: 'string',
    oneOf: [QuestionType.Pin] as const,
  },

  question: {
    kind: 'string',
    minLength: QUIZ_QUESTION_TEXT_MIN_LENGTH,
    maxLength: QUIZ_QUESTION_TEXT_MAX_LENGTH,
    regex: QUIZ_QUESTION_TEXT_REGEX,
  },

  imageURL: {
    kind: 'string',
    regex: URL_REGEX,
  },

  positionX: {
    kind: 'number',
    integer: false,
    min: 0,
    max: 1,
  },

  positionY: {
    kind: 'number',
    integer: false,
    min: 0,
    max: 1,
  },

  tolerance: {
    kind: 'string',
    oneOf: [
      QuestionPinTolerance.Low,
      QuestionPinTolerance.Medium,
      QuestionPinTolerance.High,
      QuestionPinTolerance.Maximum,
    ],
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
