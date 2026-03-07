import { DiscoverySectionKey } from '@klurigo/common'

/**
 * Fixed display order for discovery sections.
 *
 * Sections are returned in this order by `GET /discover`. Sections that are
 * absent from the snapshot or have zero entries are skipped.
 */
export const DISCOVERY_SECTION_ORDER: readonly DiscoverySectionKey[] = [
  DiscoverySectionKey.FEATURED,
  DiscoverySectionKey.TRENDING,
  DiscoverySectionKey.TOP_RATED,
  DiscoverySectionKey.MOST_PLAYED,
  DiscoverySectionKey.NEW_AND_NOTEWORTHY,
  DiscoverySectionKey.CATEGORY_SPOTLIGHT,
]
