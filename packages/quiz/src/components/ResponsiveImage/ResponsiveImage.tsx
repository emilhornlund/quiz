import React, { FC } from 'react'

import styles from './ResponsiveImage.module.scss'

export interface ResponsiveImageProps {
  imageURL?: string
  alt?: string
}

const ResponsiveImage: FC<ResponsiveImageProps> = ({ imageURL, alt }) => (
  <div className={styles.container}>
    {imageURL && <img src={imageURL} alt={alt} className={styles.image} />}
  </div>
)

export default ResponsiveImage
