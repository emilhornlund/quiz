import {
  UPLOAD_IMAGE_MAX_FILE_SIZE,
  UPLOAD_IMAGE_MIN_FILE_SIZE,
} from '@quiz/common'
import type { FC } from 'react'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

import { classNames } from '../../utils/helpers.ts'
import { notifyWarning } from '../../utils/notification.ts'
import CircularProgressBar, {
  CircularProgressBarKind,
} from '../CircularProgressBar'

import styles from './Dropzone.module.scss'

export interface DropzoneProps {
  progress?: number
  onUpload?: (file: File) => void
}

const Dropzone: FC<DropzoneProps> = ({ progress, onUpload }) => {
  const onDropAccepted = useCallback(
    (files: File[]) => {
      onUpload?.(files[0])
    },
    [onUpload],
  )

  const onDropRejected = useCallback(() => {
    notifyWarning('Upload failed. The file type or size may be invalid.')
  }, [])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: {
      'image/gif': ['.gif'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/tiff': ['.tiff'],
      'image/webp': ['.webp'],
    },
    minSize: UPLOAD_IMAGE_MIN_FILE_SIZE,
    maxSize: UPLOAD_IMAGE_MAX_FILE_SIZE,
    multiple: false,
    onDropAccepted,
    onDropRejected,
  })

  return (
    <div className={styles.dropzone}>
      <div
        {...getRootProps({
          className: classNames(
            styles.base,
            isFocused ? styles.focused : undefined,
            isDragAccept ? styles.accept : undefined,
            isDragReject ? styles.reject : undefined,
          ),
        })}>
        {typeof progress === 'number' ? (
          <CircularProgressBar
            kind={CircularProgressBarKind.Secondary}
            progress={progress}
          />
        ) : (
          <>
            <input {...getInputProps()} />
            {isDragActive ? (
              <span>Drop the files here ...</span>
            ) : (
              <span>
                Drag &#39;n&#39; drop a file here, or click to select one
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Dropzone
