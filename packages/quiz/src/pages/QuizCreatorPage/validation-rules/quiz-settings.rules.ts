import {
  LanguageCode,
  QUIZ_DESCRIPTION_MAX_LENGTH,
  QUIZ_DESCRIPTION_REGEX,
  QUIZ_TITLE_MAX_LENGTH,
  QUIZ_TITLE_MIN_LENGTH,
  QUIZ_TITLE_REGEX,
  QuizCategory,
  QuizRequestBaseDto,
  QuizVisibility,
  URL_REGEX,
} from '@quiz/common'

import { defineRules } from '../../../validation'

/**
 * Validation rules for quiz request base dto.
 *
 * Validates:
 * - Title format and length
 * - Optional description format and max length
 * - Optional cover image URL format
 * - Category is one of the supported quiz categories
 * - Visibility is `Public` or `Private`
 * - Language code is one of the supported language codes
 */
export const quizSettingsRules = defineRules<QuizRequestBaseDto>()({
  optionalKeys: ['description', 'imageCoverURL'] as const,
})({
  title: {
    kind: 'string',
    minLength: QUIZ_TITLE_MIN_LENGTH,
    maxLength: QUIZ_TITLE_MAX_LENGTH,
    regex: QUIZ_TITLE_REGEX,
  },

  description: {
    kind: 'string',
    maxLength: QUIZ_DESCRIPTION_MAX_LENGTH,
    regex: QUIZ_DESCRIPTION_REGEX,
  },

  imageCoverURL: {
    kind: 'string',
    regex: URL_REGEX,
  },

  category: {
    kind: 'string',
    oneOf: Object.values(QuizCategory) as unknown as readonly string[],
  },

  visibility: {
    kind: 'string',
    oneOf: [QuizVisibility.Public, QuizVisibility.Private] as const,
  },

  languageCode: {
    kind: 'string',
    oneOf: Object.values(LanguageCode) as unknown as readonly string[],
  },
})
