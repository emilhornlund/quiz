import type { FC, ReactElement } from 'react'

import styles from './ProfileGameCardSkeleton.module.scss'

/**
 * Skeleton placeholder for ProfileGameCard.
 *
 * Displays an animated loading state matching the ProfileGameCard structure
 * with a cover image area and three body text lines.
 *
 * @returns A skeleton card component with shimmer animation.
 */
const ProfileGameCardSkeleton: FC = (): ReactElement => {
  return (
    <div className={styles.skeleton} data-testid="profile-game-card-skeleton">
      <div className={styles.skeletonCover} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
      </div>
    </div>
  )
}

export default ProfileGameCardSkeleton
