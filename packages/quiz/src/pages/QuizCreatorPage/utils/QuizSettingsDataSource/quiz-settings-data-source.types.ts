import { QuizRequestBaseDto } from '@quiz/common'

import { ValidationResult } from '../../../../validation'

/**
 * Internal model representing the quiz settings state.
 *
 * Holds the current settings data together with field-level validity flags.
 * This structure is managed by the quiz settings data source and is not
 * intended to be mutated directly by UI components.
 *
 * - `data` contains the current partial settings values.
 * - `validation` tracks field-level validity as reported by form controls.
 */
export type QuizSettingsModel = Partial<QuizRequestBaseDto>

/**
 * Validation result for quiz settings data.
 *
 * Represents the outcome of validating the quiz settings section in the quiz
 * creator. This is derived from the current settings data and the active
 * validation rules.
 *
 * Guarantees:
 * - `valid` reflects the overall validity of the settings data.
 * - `errors` contains path-based validation errors suitable for UI mapping.
 * - `fields` provides per-field validity for direct field-level feedback.
 *
 * This type is intended to be consumed directly by UI components.
 */
export type QuizSettingsValidationResult = ValidationResult<QuizRequestBaseDto>

/**
 * Function for updating a single quiz settings field.
 *
 * Used by UI components to update quiz settings in a type-safe manner.
 * The key determines which field is updated, and the value represents the
 * new value for that field.
 *
 * Passing `undefined` clears the value for optional fields.
 *
 * This function does not perform validation directly; validation is handled
 * by the owning data source and exposed via `QuizSettingsValidationResult`.
 */
export type QuizSettingsModelFieldChangeFunction = <
  K extends keyof QuizRequestBaseDto,
>(
  key: K,
  value?: QuizRequestBaseDto[K],
) => void
