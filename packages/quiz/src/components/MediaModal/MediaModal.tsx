import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import {
  MediaType,
  PaginatedMediaPhotoSearchDto,
  QuestionMediaDto,
  URL_REGEX,
} from '@quiz/common'
import React, { FC, useMemo, useState } from 'react'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { MediaTypeLabels } from '../../models/labels.ts'
import { classNames } from '../../utils/helpers.ts'
import Button from '../Button'
import Modal from '../Modal'
import ResponsiveImage from '../ResponsiveImage'
import Select from '../Select'
import TextField from '../TextField'

import styles from './MediaModal.module.scss'

export interface MediaModalProps {
  title?: string
  imageOnly?: boolean
  type?: MediaType
  url?: string
  onChange: (value?: QuestionMediaDto) => void
  onValid: (valid: boolean) => void
  onClose: () => void
}

const MediaModal: FC<MediaModalProps> = ({
  title,
  imageOnly = false,
  type = MediaType.Image,
  url,
  onChange,
  onValid,
  onClose,
}) => {
  const [internalType, setInternalType] = useState<MediaType>(type)
  const [internalURL, setInternalURL] = useState<string | undefined>(url)

  const [internalValid, setInternalValid] = useState<{
    type: boolean
    url: boolean
  }>({ type: true, url: false })

  const isValid = useMemo(
    () => Object.values(internalValid).every((value) => value),
    [internalValid],
  )

  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] =
    useState<PaginatedMediaPhotoSearchDto>()

  const { searchPhotos } = useQuizServiceClient()
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)

  const handleChangeType = (newType: MediaType) => {
    setInternalType(newType)
    setInternalURL(undefined)
    setSearchTerm('')
    setSearchResults(undefined)
  }

  const handleSearch = () => {
    if (searchTerm.trim().length) {
      setSearchResults(undefined)
      setIsLoadingSearch(true)
      searchPhotos(searchTerm)
        .then(setSearchResults)
        .finally(() => setIsLoadingSearch(false))
    }
  }

  const onApply = () => {
    if (internalType && internalURL) {
      onChange({ type: internalType, url: internalURL })
      onValid(true)
      onClose()
    }
  }

  return (
    <Modal title={title || 'Add Media'} size="large" onClose={onClose} open>
      <div className={styles.mediaModal}>
        {!imageOnly && (
          <div className={classNames(styles.column, styles.half)}>
            <Select
              id="media-type-select"
              kind="secondary"
              value={internalType}
              values={Object.values(MediaType).map((type) => ({
                key: type,
                value: type,
                valueLabel: MediaTypeLabels[type],
              }))}
              onChange={(value) => handleChangeType(value as MediaType)}
              onValid={(valid) =>
                setInternalValid({ ...internalValid, type: valid })
              }
              required
            />
          </div>
        )}
        <div className={classNames(styles.column, styles.inline)}>
          <div className={styles.textFieldWrapper}>
            <TextField
              id="media-url-textfield"
              type="text"
              kind="secondary"
              placeholder="URL"
              value={internalURL}
              regex={{ value: URL_REGEX, message: 'Is not a valid URL' }}
              onChange={(value) => setInternalURL(value as string)}
              onValid={(valid) =>
                setInternalValid({ ...internalValid, url: valid })
              }
              required
            />
          </div>
        </div>

        {internalType === MediaType.Image && (
          <>
            <div className={classNames(styles.column, styles.divider)} />
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

            {internalType === MediaType.Image &&
              searchResults?.photos &&
              !isLoadingSearch && (
                <div
                  className={classNames(styles.column, styles.resultsColumn)}>
                  <div className={styles.resultsGrid}>
                    {searchResults.photos.map((result) => (
                      <button
                        key={result.photoURL}
                        className={styles.itemButton}
                        onClick={() => setInternalURL(result.photoURL)}>
                        <ResponsiveImage
                          imageURL={result.thumbnailURL}
                          noBorder
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </>
        )}

        <div className={classNames(styles.column, styles.divider)} />

        <div className={classNames(styles.column, styles.actions)}>
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
            disabled={!isValid}
            onClick={onApply}
          />
        </div>
      </div>
    </Modal>
  )
}

export default MediaModal
