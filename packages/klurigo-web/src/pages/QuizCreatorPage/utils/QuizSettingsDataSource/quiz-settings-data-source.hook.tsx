import type { QuizRequestBaseDto } from '@klurigo/common'
import { LanguageCode, QuizCategory, QuizVisibility } from '@klurigo/common'
import { useCallback, useMemo, useState } from 'react'

import { validateDto } from '../../../../validation'
import { quizSettingsRules } from '../../validation-rules'

import type {
  QuizSettingsModel,
  QuizSettingsModelFieldChangeFunction,
  QuizSettingsValidationResult,
} from './quiz-settings-data-source.types'

/**
 * Initial quiz settings state for the quiz editor.
 *
 * Establishes a predictable baseline where optional text fields start as
 * `undefined`, while select-like fields have sensible defaults.
 *
 * Notes:
 * - `title`, `description`, and `imageCoverURL` are intentionally `undefined` so
 *   required/format validation can drive UI state and error messaging.
 * - `category`, `visibility`, and `languageCode` default to commonly used values
 *   to reduce required user interaction.
 */
const initialData: QuizSettingsModel = {
  title: undefined,
  description: undefined,
  imageCoverURL: undefined,
  category: QuizCategory.Other,
  visibility: QuizVisibility.Public,
  languageCode: LanguageCode.English,
}

/**
 * React hook that owns quiz settings state and validation for the quiz editor.
 *
 * Provides:
 * - A mutable `settings` model (partial while the form is being filled in).
 * - A computed `settingsValidation` result derived from `quizSettingsRules`.
 * - A type-safe `updateSettingsField` helper for updating individual fields.
 *
 * Intended usage:
 * - Bind `settings` values to form inputs.
 * - Use `settingsValidation` for field-level error display.
 * - Use `allSettingsValid` to enable/disable "Continue"/"Save" actions.
 */
export const useQuizSettingsDataSource = () => {
  /**
   * Current quiz settings data being edited.
   *
   * Stored as a `QuizSettingsModel` to support incremental form entry
   * where required fields may be missing until the user completes them.
   */
  const [settings, setSettings] = useState<QuizSettingsModel>(initialData)

  /**
   * Validation result for the current settings state.
   *
   * Recomputed whenever `settings` changes and uses `quizSettingsRules` to
   * validate required fields, formats, and constraints.
   */
  const settingsValidation = useMemo<QuizSettingsValidationResult>(
    () => Object.freeze(validateDto(settings, quizSettingsRules)),
    [settings],
  )

  /**
   * Updates a single quiz settings field in a type-safe way.
   *
   * Performs a shallow merge to preserve unrelated fields.
   *
   * @param key - The settings field key to update.
   * @param value - The new value for the given field. Pass `undefined` to clear
   * the field (where supported by the DTO).
   */
  const updateSettingsField = useCallback<QuizSettingsModelFieldChangeFunction>(
    <K extends keyof QuizRequestBaseDto>(
      key: K,
      value?: QuizRequestBaseDto[K],
    ) => {
      setSettings((prevData) => ({ ...prevData, [key]: value }))
    },
    [],
  )

  return {
    settings,
    setSettings,

    settingsValidation,
    allSettingsValid: settingsValidation.valid,

    updateSettingsField,
  }
}
