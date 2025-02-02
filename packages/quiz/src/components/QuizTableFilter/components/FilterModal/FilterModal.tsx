import { GameMode, LanguageCode, QuizVisibility } from '@quiz/common'
import React, { FC, useState } from 'react'

import {
  GameModeLabels,
  LanguageLabels,
  QuizVisibilityLabels,
} from '../../../../models/labels.ts'
import { classNames } from '../../../../utils/helpers.ts'
import Button from '../../../Button'
import Modal from '../../../Modal'
import Select from '../../../Select'

import styles from './FilterModal.module.scss'

export interface FilterOptions {
  visibility?: QuizVisibility
  languageCode?: LanguageCode
  mode?: GameMode
  sort?: 'title' | 'created' | 'updated'
  order?: 'asc' | 'desc'
}

export interface FilterModalProps extends FilterOptions {
  showVisibilityFilter: boolean
  open: boolean
  onClose: () => void
  onApply: (options: FilterOptions) => void
}

const FilterModal: FC<FilterModalProps> = ({
  visibility,
  languageCode,
  mode,
  sort,
  order,
  showVisibilityFilter,
  open,
  onClose,
  onApply,
}) => {
  const [internalFilterOptions, setInternalFilterOptions] =
    useState<FilterOptions>({
      visibility,
      languageCode,
      mode,
      sort,
      order,
    })

  const handleFilterOptionChange = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K],
  ): void => {
    setInternalFilterOptions((oldFilterOptions) => ({
      ...oldFilterOptions,
      [key]: value,
    }))
  }

  const handleApplyFilter = () => {
    onApply(internalFilterOptions)
  }

  return (
    <Modal title="Refine Your Quiz Search" open={open}>
      <div className={styles.filterModalContainer}>
        Narrow down your search and find the perfect quiz!
        {showVisibilityFilter && (
          <div className={styles.row}>
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
              value={internalFilterOptions.visibility || 'none'}
              onChange={(value) =>
                handleFilterOptionChange(
                  'visibility',
                  value === 'none' ? undefined : (value as QuizVisibility),
                )
              }
            />
          </div>
        )}
        <div className={styles.row}>
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
            value={internalFilterOptions.languageCode || 'none'}
            onChange={(value) =>
              handleFilterOptionChange(
                'languageCode',
                value === 'none' ? undefined : (value as LanguageCode),
              )
            }
          />
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Game Mode</div>
          <Select
            id="game-mode-select"
            kind="secondary"
            values={[
              { key: 'none', value: 'none', valueLabel: 'None' },
              ...Object.values(GameMode).map((gameMode) => ({
                key: gameMode,
                value: gameMode,
                valueLabel: GameModeLabels[gameMode],
              })),
            ]}
            value={internalFilterOptions.mode || 'none'}
            onChange={(value) =>
              handleFilterOptionChange(
                'mode',
                value === 'none' ? undefined : (value as GameMode),
              )
            }
          />
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Sort By</div>
          <Select
            id="sort-by-select"
            kind="secondary"
            values={[
              { key: 'title', value: 'title', valueLabel: 'Title' },
              { key: 'created', value: 'created', valueLabel: 'Created' },
              { key: 'updated', value: 'updated', valueLabel: 'Updated' },
            ]}
            value={internalFilterOptions.sort || 'created'}
            onChange={(value) =>
              handleFilterOptionChange(
                'sort',
                value as 'title' | 'created' | 'updated',
              )
            }
          />
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Sort Order</div>
          <Select
            id="sort-order-select"
            kind="secondary"
            values={[
              { key: 'asc', value: 'asc', valueLabel: 'Ascending' },
              { key: 'desc', value: 'desc', valueLabel: 'Descending' },
            ]}
            value={internalFilterOptions.order || 'desc'}
            onChange={(value) =>
              handleFilterOptionChange('order', value as 'asc' | 'desc')
            }
          />
        </div>
        <div className={classNames(styles.row, styles.buttonGroup)}>
          <Button
            id="close-button"
            type="button"
            kind="secondary"
            value="Close"
            onClick={onClose}
          />
          <Button
            id="apply-button"
            type="button"
            kind="call-to-action"
            value="Apply"
            onClick={handleApplyFilter}
          />
        </div>
      </div>
    </Modal>
  )
}

export default FilterModal
