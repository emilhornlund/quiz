import { QuestionImageRevealEffectType } from '@quiz/common'
import React, { FC, useState } from 'react'

import { ImageRevealEffectLabels } from '../../models'
import { classNames } from '../../utils/helpers.ts'
import Button from '../Button'
import styles from '../ImageEffectModal/ImageEffectModal.module.scss'
import Modal from '../Modal'
import Select from '../Select'

const ImageEffectModal: FC<{
  title?: string
  onClose: () => void
  onChangeImageEffect: (
    value?: QuestionImageRevealEffectType | undefined,
  ) => void
}> = ({ title, onClose, onChangeImageEffect }) => {
  const [selectedImageEffect, setSelectedImageEffect] = useState<
    QuestionImageRevealEffectType | undefined
  >(QuestionImageRevealEffectType.Blur)

  const onApply = () => {
    onChangeImageEffect(selectedImageEffect)
    onClose()
  }

  return (
    <Modal
      title={title || 'Add Image Effect'}
      size="normal"
      onClose={onClose}
      open>
      <div className={styles.imageMediaModal}>
        <Select
          id="select-image-effect"
          kind="secondary"
          values={[
            {
              key: 'none',
              value: 'none',
              valueLabel: 'None',
            },
            ...Object.values(QuestionImageRevealEffectType).map((type) => ({
              key: type,
              value: type,
              valueLabel: ImageRevealEffectLabels[type],
            })),
          ]}
          onChange={(value) =>
            setSelectedImageEffect(
              value !== 'none'
                ? (value as QuestionImageRevealEffectType)
                : undefined,
            )
          }
          value={selectedImageEffect}
        />
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
            onClick={onApply}
          />
        </div>
      </div>
    </Modal>
  )
}

export default ImageEffectModal
