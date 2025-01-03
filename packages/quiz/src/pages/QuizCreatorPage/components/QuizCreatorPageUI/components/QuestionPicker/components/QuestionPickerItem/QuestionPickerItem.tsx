import { faCopy } from '@fortawesome/free-regular-svg-icons'
import { faCircleExclamation, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { QuestionType } from '@quiz/common'
import React, { DragEvent, FC, MouseEvent } from 'react'

import { QuestionTypeLabels } from '../../../../../../../../models/labels.ts'
import { classNames } from '../../../../../../../../utils/helpers.ts'

import styles from './QuestionPickerItem.module.scss'

export interface QuestionPickerItemProps {
  index: number
  text: string
  type: QuestionType
  active?: boolean
  error?: string
  onClick?: () => void
  onDrop?: (id: number) => void
  onDuplicate?: () => void
  onDelete?: () => void
}

const QuestionPickerItem: FC<QuestionPickerItemProps> = ({
  index,
  text,
  type,
  active,
  error,
  onClick,
  onDrop,
  onDuplicate,
  onDelete,
}) => {
  const handleClickQuestionPickerItem = (event: MouseEvent) => {
    event.preventDefault()
    onClick?.()
  }

  const handleDragQuestionPickerItem = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDropQuestionPickerItem = (event: DragEvent<HTMLDivElement>) => {
    const result = event.currentTarget.id.match(/^question-picker-item-(\d+)$/)
    if (result?.length === 2) {
      const dropIndex = parseInt(result[1])
      onDrop?.(dropIndex)
    }
  }

  const handleClickDuplicate = (event: MouseEvent) => {
    event.preventDefault()
    onDuplicate?.()
  }

  const handleClickDelete = (event: MouseEvent) => {
    event.preventDefault()
    onDelete?.()
  }

  return (
    <div
      id={`question-picker-item-${index}`}
      draggable={active}
      className={classNames(styles.questionPickerItemWrapper)}
      onClick={handleClickQuestionPickerItem}
      onDragOver={handleDragQuestionPickerItem}
      onDrop={handleDropQuestionPickerItem}>
      <button
        className={classNames(
          styles.questionPickerItemButton,
          active ? styles.questionPickerItemActive : undefined,
        )}>
        <div className={styles.questionPickerItemText}>{text}</div>
        <div className={styles.questionPickerItemType}>
          {QuestionTypeLabels[type]}
        </div>
      </button>
      <div className={styles.questionPickerItemOverlay}>
        <div className={styles.questionPickerItemOverlayTop}>
          <div
            className={classNames(
              styles.questionPickerItemOverlayNumber,
              active ? styles.questionPickerItemActive : undefined,
            )}>
            {index + 1}
          </div>
        </div>
        <div className={styles.questionPickerItemOverlayBottom}>
          {active && (
            <button
              className={styles.questionPickerItemOverlayDuplicate}
              onClick={handleClickDuplicate}>
              <FontAwesomeIcon icon={faCopy} />
            </button>
          )}
          {!!error && (
            <div
              title={error}
              className={styles.questionPickerItemOverlayError}>
              <FontAwesomeIcon icon={faCircleExclamation} />
            </div>
          )}
          {active && (
            <button
              className={styles.questionPickerItemOverlayDelete}
              onClick={handleClickDelete}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuestionPickerItem
