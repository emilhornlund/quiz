import {
  MediaType,
  QuestionImageRevealEffectType,
  QuestionMultiChoiceDto,
  QuestionType,
  QUIZ_DURATION_ALLOWED,
  QUIZ_MULTI_CHOICE_OPTION_VALUE_MAX_LENGTH,
  QUIZ_MULTI_CHOICE_OPTION_VALUE_MIN_LENGTH,
  QUIZ_MULTI_CHOICE_OPTION_VALUE_REGEX,
  QUIZ_MULTI_CHOICE_OPTIONS_MAX,
  QUIZ_MULTI_CHOICE_OPTIONS_MIN,
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

import { mustHaveAtLeastOneCorrectOption } from './validators'

/**
 * Validation rules for Classic mode MultiChoice questions.
 *
 * Validates:
 * - Discriminator type is `QuestionType.MultiChoice`
 * - Question text format and length
 * - Option list size and option value format
 * - Requires at least one option to be marked correct
 * - Optional media with supported media type and URL format
 * - Points and duration restricted to allowed constants
 * - Optional info text format and length
 */
export const classicMultiChoiceRules = defineRules<QuestionMultiChoiceDto>()({
  optionalKeys: ['media', 'info'] as const,
})({
  type: {
    kind: 'string',
    oneOf: [QuestionType.MultiChoice] as const,
  },

  question: {
    kind: 'string',
    minLength: QUIZ_QUESTION_TEXT_MIN_LENGTH,
    maxLength: QUIZ_QUESTION_TEXT_MAX_LENGTH,
    regex: QUIZ_QUESTION_TEXT_REGEX,
  },

  options: {
    kind: 'array',
    minItems: QUIZ_MULTI_CHOICE_OPTIONS_MIN,
    maxItems: QUIZ_MULTI_CHOICE_OPTIONS_MAX,
    custom: mustHaveAtLeastOneCorrectOption<QuestionMultiChoiceDto>(
      (dto) => dto.options,
      'At least one option must be marked as correct.',
    ),
    element: {
      kind: 'object',
      shape: {
        value: {
          kind: 'string',
          minLength: QUIZ_MULTI_CHOICE_OPTION_VALUE_MIN_LENGTH,
          maxLength: QUIZ_MULTI_CHOICE_OPTION_VALUE_MAX_LENGTH,
          regex: QUIZ_MULTI_CHOICE_OPTION_VALUE_REGEX,
        },
        correct: {
          kind: 'boolean',
        },
      },
    },
  },

  media: {
    kind: 'object',
    optionalKeys: ['effect'] as const,
    shape: {
      type: {
        kind: 'string',
        oneOf: [MediaType.Image, MediaType.Video, MediaType.Audio] as const,
      },
      url: {
        kind: 'string',
        regex: URL_REGEX,
      },
      effect: {
        kind: 'string',
        oneOf: [
          QuestionImageRevealEffectType.Blur,
          QuestionImageRevealEffectType.Square3x3,
          QuestionImageRevealEffectType.Square5x5,
          QuestionImageRevealEffectType.Square8x8,
        ] as const,
        custom: ({ dto }) => {
          const media = (dto as { media?: { type?: MediaType } }).media
          return media?.type === MediaType.Image
            ? null
            : 'Effect is only supported for image media.'
        },
      },
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
