import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import React, { FC, useEffect, useState } from 'react'

import { classNames } from '../../utils/helpers.ts'
import Button from '../Button'
import { TextField } from '../index.ts'

import styles from './QuizTableFilter.module.scss'

export interface QuizTableFilterProps {
  searchTerm?: string
  onSearch: (search?: string) => void
}

const QuizTableFilter: FC<QuizTableFilterProps> = ({
  searchTerm,
  onSearch,
}) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState<string>()

  useEffect(() => setInternalSearchTerm(searchTerm), [searchTerm])

  return (
    <div className={styles.quizTableFilter}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSearch(internalSearchTerm)
        }}>
        <div className={classNames(styles.column, styles.full)}>
          <TextField
            id="search-textfield"
            type="text"
            placeholder="Search"
            value={internalSearchTerm}
            onChange={(value) => setInternalSearchTerm(value as string)}
          />
        </div>
        <div className={styles.column}>
          <Button
            id="search-button"
            type="button"
            kind="call-to-action"
            icon={faMagnifyingGlass}
            onClick={() => onSearch(internalSearchTerm)}
          />
        </div>
      </form>
    </div>
  )
}

export default QuizTableFilter
