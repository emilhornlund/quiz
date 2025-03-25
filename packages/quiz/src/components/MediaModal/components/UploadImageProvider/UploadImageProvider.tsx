import React, { FC } from 'react'

import { classNames } from '../../../../utils/helpers.ts'
import styles from '../../MediaModal.module.scss'

export interface UploadImageProviderProps {
  onChange?: (value: string) => void
}

const UploadImageProvider: FC<UploadImageProviderProps> = () => (
  <div className={classNames(styles.column, styles.upload)}>WIP</div>
)

export default UploadImageProvider
