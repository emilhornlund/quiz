import type { FC, ImgHTMLAttributes } from 'react'

import styles from './PageProminentIcon.module.scss'

const PageProminentIcon: FC<Pick<ImgHTMLAttributes<never>, 'src' | 'alt'>> = ({
  src,
  alt,
}) => (
  <div className={styles.main}>
    <img src={src} alt={alt} />
  </div>
)

export default PageProminentIcon
