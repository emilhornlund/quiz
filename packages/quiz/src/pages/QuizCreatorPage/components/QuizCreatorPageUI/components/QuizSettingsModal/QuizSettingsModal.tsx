import {
  LanguageCode,
  QUIZ_DESCRIPTION_MAX_LENGTH,
  QUIZ_DESCRIPTION_REGEX,
  QUIZ_TITLE_MAX_LENGTH,
  QUIZ_TITLE_MIN_LENGTH,
  QUIZ_TITLE_REGEX,
  QuizCategory,
  QuizVisibility,
  URL_REGEX,
} from '@quiz/common'
import React, { FC } from 'react'

import { Modal } from '../../../../../../components'
import Select from '../../../../../../components/Select'
import Textarea from '../../../../../../components/Textarea'
import TextField from '../../../../../../components/TextField'
import {
  LanguageLabels,
  QuizCategoryLabels,
  QuizVisibilityLabels,
} from '../../../../../../models/labels.ts'
import {
  QuizSettingsData,
  QuizSettingsDataSourceValidChangeFunction,
  QuizSettingsDataSourceValueChangeFunction,
} from '../../../../utils/QuizSettingsDataSource'

import styles from './QuizSettingsModal.module.scss'

export interface QuizSettingsModalProps {
  values: Partial<QuizSettingsData>
  onValueChange: QuizSettingsDataSourceValueChangeFunction
  onValidChange: QuizSettingsDataSourceValidChangeFunction
  onClose: () => void
}

const QuizSettingsModal: FC<QuizSettingsModalProps> = ({
  values: {
    title,
    description,
    imageCoverURL,
    category,
    visibility,
    languageCode,
  } = {},
  onValueChange,
  onValidChange,
  onClose,
}) => (
  <Modal title="Settings" onClose={onClose} open>
    <div className={styles.quizSettingsModalWrapper}>
      <div className={styles.quizSettingsRow}>
        <div className={styles.label}>Title</div>
        <TextField
          id="quiz-title-textfield"
          type="text"
          kind="secondary"
          placeholder="Title"
          value={title}
          minLength={QUIZ_TITLE_MIN_LENGTH}
          maxLength={QUIZ_TITLE_MAX_LENGTH}
          regex={QUIZ_TITLE_REGEX}
          onChange={(value) => onValueChange('title', value as string)}
          onValid={(valid) => onValidChange('title', valid)}
          required
          forceValidate
        />
      </div>
      <div className={styles.quizSettingsRow}>
        <div className={styles.label}>Description</div>
        <Textarea
          id="quiz-description-textarea"
          placeholder="Description"
          kind="secondary"
          value={description}
          maxLength={QUIZ_DESCRIPTION_MAX_LENGTH}
          regex={QUIZ_DESCRIPTION_REGEX}
          onChange={(value) => onValueChange('description', value as string)}
          onValid={(valid) => onValidChange('description', valid)}
          forceValidate
        />
      </div>
      <div className={styles.quizSettingsRow}>
        <div className={styles.label}>Image Cover URL</div>
        <TextField
          id="quiz-image-cover-textfield"
          type="text"
          kind="secondary"
          placeholder="Image Cover URL"
          value={imageCoverURL}
          regex={URL_REGEX}
          onChange={(value) => onValueChange('imageCoverURL', value as string)}
          onValid={(valid) => onValidChange('imageCoverURL', valid)}
          forceValidate
        />
      </div>
      <div className={styles.quizSettingsRow}>
        <div className={styles.label}>Category</div>
        <Select
          id="category-select"
          kind="secondary"
          values={[
            { key: 'none', value: 'none', valueLabel: 'None' },
            ...Object.values(QuizCategory).map((category) => ({
              key: category,
              value: category,
              valueLabel: QuizCategoryLabels[category],
            })),
          ]}
          value={category || 'none'}
          onChange={(value) =>
            onValueChange(
              'category',
              value === 'none' ? undefined : (value as QuizCategory),
            )
          }
        />
      </div>
      <div className={styles.quizSettingsRow}>
        <div className={styles.label}>Visibility</div>
        <Select
          id="visibility-select"
          kind="secondary"
          values={[
            { key: 'none', value: 'none', valueLabel: 'None' },
            ...Object.values(QuizVisibility).map((visibility) => ({
              key: visibility,
              value: visibility,
              valueLabel: QuizVisibilityLabels[visibility],
            })),
          ]}
          value={visibility || 'none'}
          onChange={(value) =>
            onValueChange(
              'visibility',
              value === 'none' ? undefined : (value as QuizVisibility),
            )
          }
        />
      </div>
      <div className={styles.quizSettingsRow}>
        <div className={styles.label}>Language</div>
        <Select
          id="language-select"
          kind="secondary"
          values={[
            { key: 'none', value: 'none', valueLabel: 'None' },
            ...Object.values(LanguageCode).map((languageCode) => ({
              key: languageCode,
              value: languageCode,
              valueLabel: LanguageLabels[languageCode],
            })),
          ]}
          value={languageCode || 'none'}
          onChange={(value) =>
            onValueChange(
              'languageCode',
              value === 'none' ? undefined : (value as LanguageCode),
            )
          }
        />
      </div>
    </div>
  </Modal>
)

export default QuizSettingsModal
