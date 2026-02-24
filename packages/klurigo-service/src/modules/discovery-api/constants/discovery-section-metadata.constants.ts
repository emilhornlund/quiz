import { DiscoverySectionKey } from '@klurigo/common'

/**
 * Display metadata for a discovery rail section.
 */
type SectionMetadata = {
  readonly title: string
  readonly description?: string
}

/**
 * Human-readable display metadata for each discovery section key.
 *
 * The title and optional description are returned in API responses alongside
 * the algorithmic key so that clients can render section headings without
 * maintaining their own mapping.
 */
export const DISCOVERY_SECTION_METADATA: Readonly<
  Record<DiscoverySectionKey, SectionMetadata>
> = {
  [DiscoverySectionKey.FEATURED]: { title: 'Featured' },
  [DiscoverySectionKey.TRENDING]: { title: 'Trending' },
  [DiscoverySectionKey.TOP_RATED]: { title: 'Top Rated' },
  [DiscoverySectionKey.MOST_PLAYED]: { title: 'Most Played' },
  [DiscoverySectionKey.NEW_AND_NOTEWORTHY]: { title: 'New & Noteworthy' },
  [DiscoverySectionKey.CATEGORY_SPOTLIGHT]: { title: 'Category Spotlight' },
}

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
