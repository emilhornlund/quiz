import { faPlus, faRetweet, faTrash } from '@fortawesome/free-solid-svg-icons'
import {
  LanguageCode,
  MediaType,
  QUIZ_DESCRIPTION_MAX_LENGTH,
  QUIZ_DESCRIPTION_REGEX,
  QUIZ_TITLE_MAX_LENGTH,
  QUIZ_TITLE_MIN_LENGTH,
  QUIZ_TITLE_REGEX,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import React, { FC, useState } from 'react'

import {
  Button,
  MediaModal,
  Modal,
  ResponsiveImage,
} from '../../../../../../components'
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
}) => {
  const [showMediaModal, setShowMediaModal] = useState(false)

  const handleDeleteImageCover = () => {
    onValueChange('imageCoverURL', undefined)
    onValidChange('imageCoverURL', true)
  }

  return (
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
          <div className={styles.label}>Image Cover</div>
          {imageCoverURL && <ResponsiveImage imageURL={imageCoverURL} />}
          <Button
            id="add-image-cover-button"
            type="button"
            kind="call-to-action"
            size="small"
            value={imageCoverURL ? 'Replace' : 'Add'}
            icon={imageCoverURL ? faRetweet : faPlus}
            onClick={() => setShowMediaModal(true)}
          />
          {imageCoverURL && (
            <Button
              id="delete-image-cover-button"
              type="button"
              kind="destructive"
              size="small"
              value="Delete"
              icon={faTrash}
              onClick={handleDeleteImageCover}
            />
          )}
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
      {showMediaModal && (
        <MediaModal
          title="Add Image Cover"
          type={MediaType.Image}
          url={imageCoverURL}
          onChange={(value) =>
            value &&
            value.type === MediaType.Image &&
            onValueChange('imageCoverURL', value.url)
          }
          onValid={(valid) => onValidChange('imageCoverURL', valid)}
          onClose={() => setShowMediaModal(false)}
          imageOnly
        />
      )}
    </Modal>
  )
}

export default QuizSettingsModal
