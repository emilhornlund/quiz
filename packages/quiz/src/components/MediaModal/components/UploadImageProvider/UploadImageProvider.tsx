import type { FC } from 'react'
import { useState } from 'react'

import { useQuizServiceClient } from '../../../../api'
import config from '../../../../config.ts'
import { classNames } from '../../../../utils/helpers.ts'
import Dropzone from '../../../Dropzone'
import styles from '../../MediaModal.module.scss'

export interface UploadImageProviderProps {
  onChange?: (value: string) => void
}

const UploadImageProvider: FC<UploadImageProviderProps> = ({ onChange }) => {
  const [progress, setProgress] = useState<number>()

  const { uploadImage } = useQuizServiceClient()

  const handleUpload = (file: File) => {
    setProgress(0)
    uploadImage(file, (newProgress) => setProgress(newProgress))
      .then((response) =>
        onChange?.(
          `${config.baseUrl}${config.quizServiceImagesUrl}/${response.filename}`,
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
