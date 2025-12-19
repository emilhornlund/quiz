import { LanguageCode, QuizCategory, QuizVisibility } from '@quiz/common'
import { useCallback, useMemo, useState } from 'react'

import { buildValidationModel } from '../../../../utils/validation'

import {
  QuizSettingsData,
  QuizSettingsDataSourceValidationModel,
  QuizSettingsDataSourceValidChangeFunction,
  QuizSettingsDataSourceValueChangeFunction,
} from './quiz-settings-data-source.types.ts'
import { quizSettingsDataValidationRules } from './validation-model.builder.rules.ts'

/**
 * Return value for the quiz settings data source hook.
 *
 * Properties:
 * - values:
 *   Current quiz settings values. Partial during editing.
 *
 * - valid:
 *   Aggregate validation result. True only if all fields are valid.
 *
 * - setValues:
 *   Replaces the entire quiz settings object and recomputes validation.
 *
 * - onValueChange:
 *   Updates a single quiz setting value.
 *
 * - onValidChange:
 *   Updates validation status for a single quiz setting field.
 */
type QuizSettingsDataSourceReturnType = {
  values: Partial<QuizSettingsData>
  valid: boolean
  setValues: (values: QuizSettingsData) => void
  onValueChange: QuizSettingsDataSourceValueChangeFunction
  onValidChange: QuizSettingsDataSourceValidChangeFunction
}

/**
 * Initial quiz settings used by the quiz creator.
 *
 * Notes:
 * - Optional string fields are initialized as `undefined` to represent "not provided".
 * - Enum-backed fields are initialized to sensible defaults to avoid undefined UI state.
 */
const initialData: Partial<QuizSettingsData> = {
  title: undefined,
  description: undefined,
  imageCoverURL: undefined,
  category: QuizCategory.Other,
  visibility: QuizVisibility.Public,
  languageCode: LanguageCode.English,
}

/**
 * React hook that manages quiz settings state and aggregated validation.
 *
 * This hook acts as a small state container for the Quiz Creator flow. It
 * centralizes both the current quiz settings values and their validation
 * status, while exposing a minimal API for updating individual fields and
 * reporting validation changes from UI components.
 *
 * Responsibilities:
 * - Provide default quiz settings values.
 * - Track per-field validation state.
 * - Expose a derived `valid` flag representing overall form validity.
 * - Allow both bulk replacement of values and granular updates.
 *
 * Initial state:
 * - Required fields (e.g. `title`) start as invalid.
 * - Optional or defaulted fields start as valid.
 *
 * Validation model:
 * - Validation is tracked per field.
 * - Overall validity is computed by requiring all validation flags to be true.
 *
 * Intended usage:
 * - Form inputs call `onValueChange` when their value changes.
 * - Field-level validators call `onValidChange` to report validity.
 * - Consumers read `values` and `valid` to drive UI state and submission logic.
 *
 * Notes:
 * - `setValues` replaces the entire data object and recomputes validation.
 * - This hook derives initial validation and recomputes validation for bulk
 *   updates via `buildValidationModel`. Field-level components may still report
 *   validity via `onValidChange`.
 */
export const useQuizSettingsDataSource =
  (): QuizSettingsDataSourceReturnType => {
    const [model, setModel] = useState<QuizSettingsDataSourceValidationModel>({
      data: initialData,
      validation: buildValidationModel(
        initialData,
        quizSettingsDataValidationRules,
      ).validation,
    })

    const values = useMemo<Partial<QuizSettingsData>>(() => model.data, [model])

    const valid = useMemo(() => {
      const validationValues = Object.values(model.validation)
      return validationValues.length > 0 && validationValues.every(Boolean)
    }, [model.validation])

    /**
     * Replaces all quiz setting values at once and recomputes validation for all fields.
     *
     * This is useful when initializing the form from existing data or restoring
     * a previously saved draft. Validation is recomputed.
     *
     * @param values - Complete quiz settings object
     */
    const setValues = useCallback((values: QuizSettingsData) => {
      setModel({
        data: values,
        validation: buildValidationModel(
          values,
          quizSettingsDataValidationRules,
        ).validation,
      })
    }, [])

    /**
     * Updates a single quiz setting value.
     *
     * This function is typically called from controlled form inputs.
     * It does not perform validation and does not affect validity directly.
     *
     * @param key - Quiz setting key to update
     * @param value - New value for the setting
     */
    const onValueChange = useCallback(
      <K extends keyof QuizSettingsData>(
        key: K,
        value?: QuizSettingsData[K],
      ) => {
        setModel((prevModel) => ({
          ...prevModel,
          data: { ...prevModel.data, [key]: value },
        }))
      },
      [],
    )

    /**
     * Updates validation state for a single quiz setting.
     *
     * This function is typically called by field-level validators or input
     * components that know when their value is valid.
     *
     * @param key - Quiz setting key being validated
     * @param valid - Whether the field is currently valid
     */
    const onValidChange = useCallback(
      <K extends keyof QuizSettingsData>(key: K, valid: boolean) => {
        setModel((prevModel) => ({
          ...prevModel,
          validation: { ...prevModel.validation, [key]: valid },
        }))
      },
      [],
    )

    return { values, setValues, valid, onValueChange, onValidChange }
  }
