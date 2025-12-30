import type { FC } from 'react'
import { useState } from 'react'

import { useKlurigoServiceClient } from '../../../../api'
import config from '../../../../config'
import { classNames } from '../../../../utils/helpers'
import Dropzone from '../../../Dropzone'
import styles from '../../MediaModal.module.scss'

export interface UploadImageProviderProps {
  onChange?: (value: string) => void
}

const UploadImageProvider: FC<UploadImageProviderProps> = ({ onChange }) => {
  const [progress, setProgress] = useState<number>()

  const { uploadImage } = useKlurigoServiceClient()

  const handleUpload = (file: File) => {
    setProgress(0)
    uploadImage(file, (newProgress) => setProgress(newProgress))
      .then((response) =>
        onChange?.(
          `${config.baseUrl}${config.klurigoServiceImagesUrl}/${response.filename}`,
        ),
      )
      .finally(() => setProgress(undefined))
  }

  return (
    <div className={classNames(styles.column, styles.upload)}>
      <Dropzone progress={progress} onUpload={handleUpload} />
    </div>
  )
}

export default UploadImageProvider
