import { QuestionImageRevealEffectType } from '@quiz/common'
import React, { FC, useState } from 'react'

import {
  Button,
  Modal,
  Select,
} from '../../../../../../../../../../../components'
import { ImageRevealEffectLabels } from '../../../../../../../../../../../models'
import { classNames } from '../../../../../../../../../../../utils/helpers.ts'

import styles from './ImageEffectModal.module.scss'

export const NONE_KEY = 'none'

export type ImageEffectModalProps = {
  title?: string
  value?: QuestionImageRevealEffectType
  onClose: () => void
  onChangeImageEffect: (
    value?: QuestionImageRevealEffectType | undefined,
  ) => void
}

const ImageEffectModal: FC<ImageEffectModalProps> = ({
  title,
  value,
  onClose,
  onChangeImageEffect,
}) => {
  const [selectedImageEffect, setSelectedImageEffect] = useState<
    QuestionImageRevealEffectType | undefined
  >(value)

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
              key: NONE_KEY,
              value: NONE_KEY,
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
              value !== NONE_KEY
                ? (value as QuestionImageRevealEffectType)
                : undefined,
            )
          }
          value={selectedImageEffect ?? NONE_KEY}
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
