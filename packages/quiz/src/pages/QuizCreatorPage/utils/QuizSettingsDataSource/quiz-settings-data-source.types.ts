import { LanguageCode, QuizCategory, QuizVisibility } from '@quiz/common'

/**
 * Data model representing configurable quiz settings.
 *
 * This interface defines the canonical shape of quiz metadata used during
 * quiz creation and editing. It is intentionally UI-agnostic and shared
 * between state management and validation layers.
 *
 * Notes:
 * - Required fields must be validated before submission.
 * - Optional fields may be omitted during creation.
 * - Default values are typically provided by the data source hook.
 */
export interface QuizSettingsData {
  /**
   * The title of the quiz.
   *
   * Required at submission time:
   * - During editing this may be `undefined` because the UI model uses `Partial<QuizSettingsData>`.
   * - A non-empty title must be provided (and validated) before the quiz can be created.
   */
  title: string

  /**
   * A short description of the quiz.
   *
   * This field is optional and may be left undefined.
   */
  description?: string

  /**
   * The URL of the cover image for the quiz.
   *
   * This field is optional and typically validated only if provided.
   */
  imageCoverURL?: string

  /**
   * Visibility setting for the quiz.
   *
   * Determines whether the quiz is publicly discoverable or restricted.
   */
  visibility: QuizVisibility

  /**
   * Category used to classify the quiz.
   *
   * Categories are used for organization, filtering, and discovery.
   */
  category: QuizCategory

  /**
   * Language code representing the primary language of the quiz.
   *
   * Used for localization and content targeting.
   */
  languageCode: LanguageCode
}

/**
 * Function signature for updating a single quiz setting value.
 *
 * This function is typically exposed by a data source or hook and called
 * from controlled form inputs. It is strongly typed to ensure that the
 * value matches the key being updated.
 *
 * @typeParam K - A key of `QuizSettingsData`
 * @param key - The quiz setting to update
 * @param value - The new value for the setting
 */
export type QuizSettingsDataSourceValueChangeFunction = <
  K extends keyof QuizSettingsData,
>(
  key: K,
  value?: QuizSettingsData[K],
) => void

/**
 * Function signature for reporting validation state of a quiz setting.
 *
 * This function is used by field-level validators to communicate whether
 * a specific setting is currently valid.
 *
 * @typeParam K - A key of `QuizSettingsData`
 * @param key - The quiz setting being validated
 * @param valid - Whether the field value is valid
 */
export type QuizSettingsDataSourceValidChangeFunction = <
  K extends keyof QuizSettingsData,
>(
  key: K,
  valid: boolean,
) => void

/**
 * Internal validation model used by the quiz settings data source.
 *
 * Structure:
 * - `data` holds the current (possibly partial) quiz settings.
 * - `validation` tracks per-field validation state.
 *
 * Notes:
 * - `data` is partial to allow incremental editing.
 * - Validation entries may be omitted until a field has been evaluated.
 */
export type QuizSettingsDataSourceValidationModel = {
  data: Partial<QuizSettingsData>
  validation: { [key in keyof QuizSettingsData]?: boolean }
}
