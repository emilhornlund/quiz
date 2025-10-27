import React, { FC, useMemo, useState } from 'react'

import { classNames } from '../../utils/helpers.ts'
import Button from '../Button'
import styles from '../ImageEffectModal/ImageEffectModal.module.scss'
import Modal from '../Modal'
import Select from '../Select'
import TextField from '../TextField'

export interface ImageEffect {
  effect: 'blur' | 'square'
  numberOfSquares?: number
}

const ImageEffectModal: FC<{
  title?: string
  onClose: () => void
  onValid: (valid: boolean) => void
  onChangeImageEffect: (value?: ImageEffect | undefined) => void
}> = ({ title, onClose, onValid, onChangeImageEffect }) => {
  const [selectedImageEffect, setSelectedImageEffect] = useState<ImageEffect>({
    effect: 'blur',
  })

  const isValid = useMemo(() => {
    if (selectedImageEffect.effect === 'square') {
      return (
        !!selectedImageEffect.numberOfSquares &&
        !isNaN(selectedImageEffect.numberOfSquares) &&
        selectedImageEffect.numberOfSquares > 0
      )
    }
    return !!selectedImageEffect.effect
  }, [selectedImageEffect])

  const onApply = () => {
    if (selectedImageEffect) {
      onChangeImageEffect(selectedImageEffect)
      onValid(true)
      onClose()
    }
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
            { key: 'blur', value: 'blur', valueLabel: 'Blur' },
            { key: 'square', value: 'square', valueLabel: 'Square' },
          ]}
          onChange={(value) =>
            setSelectedImageEffect((prev) => {
              return { ...prev, effect: value as ImageEffect['effect'] }
            })
          }
          value={selectedImageEffect.effect}
        />
        {selectedImageEffect.effect === 'square' && (
          <TextField
            id="number-of-squares"
            type="number"
            placeholder="Number of squares"
            kind="secondary"
            required
            onChange={(value) =>
              setSelectedImageEffect((prev) => {
                return {
                  ...prev,
                  numberOfSquares: value as ImageEffect['numberOfSquares'],
                }
              })
            }
          />
        )}
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

export default ImageEffectModal
