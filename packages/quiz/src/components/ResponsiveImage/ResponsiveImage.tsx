import React, { FC } from 'react'

import styles from './ResponsiveImage.module.scss'

export interface ResponsiveImageProps {
  imageURL?: string
  alt?: string
  noBorder?: boolean
}

const ResponsiveImage: FC<ResponsiveImageProps> = ({
  imageURL,
  alt,
  noBorder = false,
}) => (
  <div className={styles.container}>
    {imageURL && (
      <img
        src={imageURL}
        alt={alt}
        className={styles.image}
        style={{ ...(noBorder ? { border: 'none' } : {}) }}
      />
    )}
  </div>
)

export default ResponsiveImage
