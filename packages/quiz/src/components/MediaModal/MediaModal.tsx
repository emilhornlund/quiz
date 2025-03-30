import { MediaType, QuestionMediaDto, URL_REGEX } from '@quiz/common'
import React, { FC, useMemo, useState } from 'react'

import { MediaTypeLabels } from '../../models/labels.ts'
import { classNames } from '../../utils/helpers.ts'
import Button from '../Button'
import Modal from '../Modal'
import SegmentedControl from '../SegmentedControl'
import Select from '../Select'
import TextField from '../TextField'

import { PexelsImageProvider, UploadImageProvider } from './components'
import styles from './MediaModal.module.scss'

const IMAGE_PROVIDER_PEXELS_VALUE = 'pexels'
const IMAGE_PROVIDER_UPLOAD_VALUE = 'upload'

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

  const handleChangeType = (newType: MediaType) => {
    setInternalType(newType)
    setInternalURL(undefined)
  }

  const onApply = () => {
    if (internalType && internalURL) {
      onChange({ type: internalType, url: internalURL })
      onValid(true)
      onClose()
    }
  }

  const [selectedImageProvider, setSelectedImageProvider] = useState<string>(
    IMAGE_PROVIDER_PEXELS_VALUE,
  )

  return (
    <Modal title={title || 'Add Media'} size="normal" onClose={onClose} open>
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
            <div className={styles.column}>
              <SegmentedControl
                id="selected-provider-segmented-control"
                kind="secondary"
                size="small"
                value={selectedImageProvider}
                values={[
                  {
                    key: IMAGE_PROVIDER_PEXELS_VALUE,
                    value: IMAGE_PROVIDER_PEXELS_VALUE,
                    valueLabel: 'Pexels',
                  },
                  {
                    key: IMAGE_PROVIDER_UPLOAD_VALUE,
                    value: IMAGE_PROVIDER_UPLOAD_VALUE,
                    valueLabel: 'Upload',
                  },
                ]}
                onChange={setSelectedImageProvider}
              />
            </div>

            {selectedImageProvider === IMAGE_PROVIDER_PEXELS_VALUE && (
              <PexelsImageProvider onChange={setInternalURL} />
            )}
            {selectedImageProvider === IMAGE_PROVIDER_UPLOAD_VALUE && (
              <UploadImageProvider onChange={setInternalURL} />
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
