import { faFilter, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { GameMode, LanguageCode, QuizVisibility } from '@quiz/common'
import React, { FC, FormEvent, useState } from 'react'

import { classNames } from '../../utils/helpers.ts'
import Button from '../Button'
import { TextField } from '../index.ts'

import FilterModal from './components/FilterModal'
import styles from './QuizTableFilter.module.scss'

export interface FilterOptions {
  search?: string
  visibility?: QuizVisibility
  languageCode?: LanguageCode
  mode?: GameMode
  sort?: 'title' | 'created' | 'updated'
  order?: 'asc' | 'desc'
}

export interface QuizTableFilterProps {
  showVisibilityFilter?: boolean
  onChange?: (options: FilterOptions) => void
}

const QuizTableFilter: FC<QuizTableFilterProps> = ({
  showVisibilityFilter = false,
  onChange,
}) => {
  const [internalFilter, setInternalFilter] = useState<FilterOptions>({
    sort: 'created',
    order: 'desc',
  })

  const [showFilterModal, setShowFilterModal] = useState(false)

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault()
    onChange?.(internalFilter)
  }

  const handleSearch = (): void => {
    onChange?.(internalFilter)
  }

  const handleApplyFilter = (options: Omit<FilterOptions, 'search'>) => {
    setShowFilterModal(false)
    const newFilter: FilterOptions = { ...internalFilter, ...options }
    setInternalFilter(newFilter)
    onChange?.(newFilter)
  }

  return (
    <>
      <div className={styles.quizTableFilter}>
        <form onSubmit={handleSubmit}>
          <div className={classNames(styles.column, styles.full)}>
            <TextField
              id="search-textfield"
              type="text"
              placeholder="Search"
              value={internalFilter.search}
              onChange={(value) =>
                setInternalFilter({
                  ...internalFilter,
                  search: value as string,
                })
              }
            />
          </div>
          <div className={styles.column}>
            <Button
              id="search-button"
              type="button"
              kind="primary"
              icon={faMagnifyingGlass}
              onClick={handleSearch}
            />
          </div>
          <div className={styles.column}>
            <Button
              id="filter-button"
              type="button"
              kind="primary"
              icon={faFilter}
              onClick={() => setShowFilterModal(true)}
            />
          </div>
        </form>
      </div>
      <FilterModal
        {...internalFilter}
        showVisibilityFilter={showVisibilityFilter}
        open={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilter}
      />
    </>
  )
}

export default QuizTableFilter
