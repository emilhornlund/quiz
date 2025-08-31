import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { MediaType, QuestionPinDto, QuestionPinTolerance } from '@quiz/common'
import React, { FC, useState } from 'react'

import {
  Button,
  MediaModal,
  PinImage,
} from '../../../../../../../../../components'

import styles from './PinQuestionField.module.scss'

export type PinQuestionFieldSubfields = Pick<
  QuestionPinDto,
  'imageURL' | 'positionX' | 'positionY'
>

export type PinQuestionFieldProps = {
  imageURL?: string
  position?: { x?: number; y?: number }
  tolerance?: QuestionPinTolerance
  onImageUrlChange: (value?: string) => void
  onImageUrlValid: (valid: boolean) => void
  onPositionChange: (value?: { x: number; y: number }) => void
  onPositionValid: (valid: boolean) => void
}

const PinQuestionField: FC<PinQuestionFieldProps> = ({
  imageURL,
  position,
  tolerance,
  onImageUrlChange,
  onImageUrlValid,
  onPositionChange,
  onPositionValid,
}) => {
  const [showMediaModal, setShowMediaModal] = useState(false)

  return (
    <>
      <div className={styles.pinQuestionField}>
        {imageURL ? (
          <PinImage
            imageURL={imageURL}
            value={{ x: position?.x ?? 0.5, y: position?.y ?? 0.5, tolerance }}
            alt={imageURL}
            onChange={onPositionChange}
            onValid={onPositionValid}
          />
        ) : (
          <Button
            id="add-image-button"
            type="button"
            kind="call-to-action"
            size="small"
            value="Add Pin Image"
            icon={faPlus}
            onClick={() => setShowMediaModal(true)}
          />
        )}
      </div>
      {showMediaModal && (
        <MediaModal
          title="Add Pin Image"
          type={MediaType.Image}
          url={imageURL}
          onChange={(newValue) => onImageUrlChange(newValue?.url)}
          onValid={onImageUrlValid}
          onClose={() => setShowMediaModal(false)}
          imageOnly
        />
      )}
    </>
  )
}

export default PinQuestionField
