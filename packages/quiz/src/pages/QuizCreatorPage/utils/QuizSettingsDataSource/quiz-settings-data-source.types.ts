import { LanguageCode, QuizCategory, QuizVisibility } from '@quiz/common'

export interface QuizSettingsData {
  /**
   * The title of the quiz.
   */
  title: string

  /**
   * A description of the quiz.
   */
  description: string

  /**
   * The URL of the cover image for the quiz.
   */
  imageCoverURL?: string

  /**
   * Whether the quiz's visibility is public or private.
   */
  visibility: QuizVisibility

  /**
   * description here.
   */
  category: QuizCategory

  /**
   * The language code of the quiz.
   */
  languageCode: LanguageCode
}

export type QuizSettingsDataSourceValueChangeFunction = <
  K extends keyof QuizSettingsData,
>(
  key: K,
  value?: QuizSettingsData[K],
) => void

export type QuizSettingsDataSourceValidChangeFunction = <
  K extends keyof QuizSettingsData,
>(
  key: K,
  valid: boolean,
) => void

export type QuizSettingsDataSourceValidationModel = {
  data: Partial<QuizSettingsData>
  validation: { [key in keyof QuizSettingsData]?: boolean }
}
