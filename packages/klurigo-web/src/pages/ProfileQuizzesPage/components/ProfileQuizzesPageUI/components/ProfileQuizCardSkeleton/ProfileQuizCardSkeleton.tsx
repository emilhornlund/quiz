import type { FC, ReactElement } from 'react'

import styles from './ProfileQuizCardSkeleton.module.scss'

/**
 * Skeleton placeholder for ProfileQuizCard.
 *
 * Displays an animated loading state matching the ProfileQuizCard structure
 * with a cover image area and three body text lines.
 *
 * @returns A skeleton card component with shimmer animation.
 */
const ProfileQuizCardSkeleton: FC = (): ReactElement => {
  return (
    <div className={styles.skeleton} data-testid="profile-quiz-card-skeleton">
      <div className={styles.skeletonCover} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
      </div>
    </div>
  )
}

export default ProfileQuizCardSkeleton
