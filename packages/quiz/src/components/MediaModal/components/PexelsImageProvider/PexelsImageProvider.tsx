import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { PaginatedMediaPhotoSearchDto } from '@quiz/common'
import React, { FC, useState } from 'react'

import { useQuizServiceClient } from '../../../../api/use-quiz-service-client.tsx'
import { classNames } from '../../../../utils/helpers.ts'
import Button from '../../../Button'
import ResponsiveImage from '../../../ResponsiveImage'
import TextField from '../../../TextField'
import styles from '../../MediaModal.module.scss'

export interface PexelsImageProviderProps {
  onChange?: (url: string) => void
}

const PexelsImageProvider: FC<PexelsImageProviderProps> = ({ onChange }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] =
    useState<PaginatedMediaPhotoSearchDto>()

  const { searchPhotos } = useQuizServiceClient()
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)

  const handleSearch = () => {
    if (searchTerm.trim().length) {
      setSearchResults(undefined)
      setIsLoadingSearch(true)
      searchPhotos(searchTerm)
        .then(setSearchResults)
        .finally(() => setIsLoadingSearch(false))
    }
  }

  return (
    <>
      <div className={classNames(styles.column, styles.search)}>
        <div className={styles.textFieldWrapper}>
          <TextField
            id="image-search-textfield"
            type="text"
            kind="secondary"
            value={searchTerm}
            placeholder="Search"
            onChange={(value) => setSearchTerm(value as string)}
          />
        </div>
        <Button
          id="image-search-button"
          type="button"
          kind="call-to-action"
          icon={faMagnifyingGlass}
          loading={isLoadingSearch}
          disabled={!searchTerm.trim().length}
          onClick={handleSearch}
        />
      </div>

      {searchResults?.photos && !isLoadingSearch && (
        <div className={classNames(styles.column, styles.resultsColumn)}>
          <div className={styles.resultsGrid}>
            {searchResults.photos.map((result) => (
              <button
                key={result.photoURL}
                className={styles.itemButton}
                onClick={() => onChange?.(result.photoURL)}>
                <ResponsiveImage imageURL={result.thumbnailURL} noBorder />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default PexelsImageProvider
