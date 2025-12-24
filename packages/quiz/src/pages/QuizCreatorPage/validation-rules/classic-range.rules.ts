import type { QuestionRangeDto } from '@quiz/common'
import {
  MediaType,
  QuestionRangeAnswerMargin,
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
} from '@quiz/common'

import { defineRules } from '../../../validation'

import {
  chain,
  mustBeGreaterThanOrEqual,
  mustBeLessThanOrEqual,
} from './validators'

/**
 * Validation rules for Classic mode Range questions.
 *
 * Validates:
 * - Discriminator type is `QuestionType.Range`
 * - Question text format and length
 * - Optional media with supported media type and URL format
 * - Numeric bounds and cross-field invariants:
 *   - min <= max
 *   - correct is within [min..max]
 * - Margin is one of the supported answer margin levels
 * - Points and duration restricted to allowed constants
 * - Optional info text format and length
 */
export const classicRangeRules = defineRules<QuestionRangeDto>()({
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

  min: {
    kind: 'number',
    integer: true,
    custom: mustBeLessThanOrEqual<QuestionRangeDto>(
      (dto) => dto.max,
      'Min must be less than or equal to max.',
    ),
  },

  max: {
    kind: 'number',
    integer: true,
    custom: mustBeGreaterThanOrEqual<QuestionRangeDto>(
      (dto) => dto.min,
      'Max must be greater than or equal to min.',
    ),
  },

  correct: {
    kind: 'number',
    integer: true,
    custom: chain<number, QuestionRangeDto>(
      mustBeGreaterThanOrEqual<QuestionRangeDto>(
        (dto) => dto.min,
        'Correct must be greater than or equal to min.',
      ),
      mustBeLessThanOrEqual<QuestionRangeDto>(
        (dto) => dto.max,
        'Correct must be less than or equal to max.',
      ),
    ),
  },

  margin: {
    kind: 'string',
    oneOf: [
      QuestionRangeAnswerMargin.None,
      QuestionRangeAnswerMargin.Low,
      QuestionRangeAnswerMargin.Medium,
      QuestionRangeAnswerMargin.High,
      QuestionRangeAnswerMargin.Maximum,
    ] as const,
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
