import type { DiscoverySectionDto } from '@klurigo/common'
import type { FC } from 'react'

import { Page, Typography } from '../../../../components'
import {
  DISCOVERY_SECTION_DESCRIPTIONS,
  DISCOVERY_SECTION_TITLES,
} from '../../../../utils/discovery.utils'

import { DiscoveryRailSection } from './components'
import styles from './DiscoverRailsPageUI.module.scss'

/**
 * Props for the DiscoverRailsPageUI component.
 */
export type DiscoverRailsPageUIProps = {
  /** Ordered list of discovery sections to render. */
  readonly sections: DiscoverySectionDto[]
  /** When true, shows skeleton loading state for each section. */
  readonly isLoading: boolean
}

/** Placeholder section keys used during loading to render skeleton rails. */
const LOADING_SKELETON_SECTIONS = [
  'skeleton-1',
  'skeleton-2',
  'skeleton-3',
] as const

/**
 * Presentational component for the discovery rails page.
 *
 * Renders a page title, subtitle, and an ordered list of
 * DiscoveryRailSection components. Shows skeleton rails during
 * loading and an empty state when no sections are available.
 */
const DiscoverRailsPageUI: FC<DiscoverRailsPageUIProps> = ({
  sections,
  isLoading,
}) => (
  <Page align="start" discover profile>
    <div className={styles.container}>
      <div className={styles.heading}>
        <Typography variant="title" size="full">
          Discover
        </Typography>
        <Typography variant="text" size="full">
          Explore curated quizzes across different categories
        </Typography>
      </div>
      <div className={styles.rails}>
        {isLoading ? (
          LOADING_SKELETON_SECTIONS.map((key) => (
            <DiscoveryRailSection
              key={key}
              sectionKey={'FEATURED' as never}
              title=""
              quizzes={[]}
              isLoading={true}
            />
          ))
        ) : sections.length > 0 ? (
          sections.map((section) => (
            <DiscoveryRailSection
              key={section.key}
              sectionKey={section.key}
              title={DISCOVERY_SECTION_TITLES[section.key]}
              description={DISCOVERY_SECTION_DESCRIPTIONS[section.key]}
              quizzes={section.quizzes}
              isLoading={false}
            />
          ))
        ) : (
          <p className={styles.emptyState} data-testid="empty-state">
            More quizzes coming soon — check back later!
          </p>
        )}
      </div>
    </div>
  </Page>
)

export default DiscoverRailsPageUI
