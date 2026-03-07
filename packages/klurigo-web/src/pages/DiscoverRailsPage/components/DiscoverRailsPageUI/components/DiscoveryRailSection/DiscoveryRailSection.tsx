import {
  faArrowRight,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { DiscoveryQuizCardDto, DiscoverySectionKey } from '@klurigo/common'
import { type FC, useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { QuizDiscoveryCard } from '../../../../../../components'

import styles from './DiscoveryRailSection.module.scss'

/** Number of skeleton placeholder cards shown during loading. */
const DISCOVERY_RAIL_SKELETON_COUNT = 10

/**
 * Props for the DiscoveryRailSection component.
 */
export type DiscoveryRailSectionProps = {
  /** The section key used for building the "See all" route. */
  readonly sectionKey: DiscoverySectionKey
  /** The human-readable section heading. */
  readonly title: string
  /** Optional subtitle or contextual description. */
  readonly description?: string
  /** Ordered list of quiz cards to display. */
  readonly quizzes: DiscoveryQuizCardDto[]
  /** When true, renders skeleton placeholder cards instead of real data. */
  readonly isLoading: boolean
}

/**
 * Renders a single horizontal discovery rail section.
 *
 * Displays a heading with an optional description, a horizontally
 * scrollable row of quiz cards (with CSS scroll-snap), and a
 * "See all" link that navigates to the section detail page.
 * When loading, renders skeleton placeholder cards.
 *
 * On desktop, left/right arrow buttons appear on hover to page through
 * the rail. Edge fade shadows give a visual cue that the rail is
 * scrollable. Both arrows and fades are hidden once the rail reaches
 * the respective scroll boundary.
 */
const DiscoveryRailSection: FC<DiscoveryRailSectionProps> = ({
  sectionKey,
  title,
  description,
  quizzes,
  isLoading,
}) => {
  const railRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  /**
   * Re-evaluates whether the rail can scroll left or right based on the
   * current scroll position and element dimensions.
   */
  const updateScrollState = useCallback(() => {
    const el = railRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const el = railRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      observer.disconnect()
    }
  }, [updateScrollState, quizzes, isLoading])

  /**
   * Scrolls the rail by one visible viewport width in the given direction.
   *
   * @param direction - `'left'` or `'right'`
   */
  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = railRef.current
    if (!el) return
    el.scrollBy({
      left: direction === 'left' ? -el.clientWidth : el.clientWidth,
      behavior: 'smooth',
    })
  }, [])

  const wrapperClasses = [
    styles.railWrapper,
    canScrollLeft ? styles.hasScrollLeft : '',
    canScrollRight ? styles.hasScrollRight : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={styles.section} data-testid="discovery-rail-section">
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <Link to={`/discover/section/${sectionKey}`} className={styles.seeAll}>
          See all <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </div>
      <div className={wrapperClasses} data-testid="discovery-rail-wrapper">
        <button
          className={[styles.arrowButton, styles.arrowPrev].join(' ')}
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          tabIndex={-1}
          data-testid="rail-arrow-prev">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div
          className={styles.rail}
          ref={railRef}
          data-testid="discovery-rail-scroll">
          {isLoading
            ? Array.from({ length: DISCOVERY_RAIL_SKELETON_COUNT }).map(
                (_, i) => (
                  <div
                    key={i}
                    className={styles.skeleton}
                    data-testid="skeleton-card">
                    <div className={styles.skeletonCover} />
                    <div className={styles.skeletonBody}>
                      <div className={styles.skeletonLine} />
                      <div className={styles.skeletonLine} />
                      <div className={styles.skeletonLine} />
                    </div>
                  </div>
                ),
              )
            : quizzes.map((quiz) => (
                <QuizDiscoveryCard key={quiz.id} quiz={quiz} />
              ))}
        </div>
        <button
          className={[styles.arrowButton, styles.arrowNext].join(' ')}
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          tabIndex={-1}
          data-testid="rail-arrow-next">
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </section>
  )
}

export { DISCOVERY_RAIL_SKELETON_COUNT }
export default DiscoveryRailSection
