import {
  QUIZ_DESCRIPTION_MAX_LENGTH,
  QUIZ_DESCRIPTION_REGEX,
  QUIZ_TITLE_MAX_LENGTH,
  QUIZ_TITLE_MIN_LENGTH,
  QUIZ_TITLE_REGEX,
  URL_REGEX,
} from '@quiz/common'

import { ValidationRules } from '../../../../utils/validation'

import { QuizSettingsData } from './quiz-settings-data-source.types.ts'

/**
 * Validation rules for `QuizSettingsData`.
 *
 * Used by:
 * - `buildValidationModel` to derive a per-field validation model and errors list.
 *
 * Rule semantics:
 * - `required`: When `true`, `undefined`, `null`, and empty strings are invalid.
 * - `minLength`/`maxLength`: Applied to string fields only.
 * - `regex`: Applied to string fields only.
 *
 * Notes:
 * - Enum-backed fields are marked as required to ensure the model is complete.
 * - Optional text fields (e.g. `description`, `imageCoverURL`) validate only when provided.
 */
export const quizSettingsDataValidationRules: ValidationRules<QuizSettingsData> =
  {
    title: {
      required: true,
      minLength: QUIZ_TITLE_MIN_LENGTH,
      maxLength: QUIZ_TITLE_MAX_LENGTH,
      regex: QUIZ_TITLE_REGEX,
    },
    description: {
      maxLength: QUIZ_DESCRIPTION_MAX_LENGTH,
      regex: QUIZ_DESCRIPTION_REGEX,
    },
    imageCoverURL: {
      regex: URL_REGEX,
    },
    category: { required: true },
    visibility: { required: true },
    languageCode: { required: true },
  }
