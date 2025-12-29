import type { FC, ImgHTMLAttributes } from 'react'

import styles from './PageProminentIcon.module.scss'

const PageProminentIcon: FC<Pick<ImgHTMLAttributes<never>, 'src' | 'alt'>> = ({
  src,
  alt,
}) => (
  <div className={styles.main}>
    <div className={styles.float}>
      <img className={styles.image} src={src} alt={alt} />
    </div>
  </div>
)

export default PageProminentIcon
