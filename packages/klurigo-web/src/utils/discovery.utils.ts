import { DiscoverySectionKey } from '@klurigo/common'

/** Set of valid DiscoverySectionKey values for runtime validation. */
const DISCOVERY_SECTION_KEY_VALUES = new Set<string>(
  Object.values(DiscoverySectionKey),
)

/**
 * Type guard that checks whether a string is a valid DiscoverySectionKey.
 *
 * @param value - The string to validate.
 * @returns True if the value is a member of the DiscoverySectionKey enum.
 */
export const isDiscoverySectionKey = (
  value: string,
): value is DiscoverySectionKey => DISCOVERY_SECTION_KEY_VALUES.has(value)

/**
 * Client-side mapping of discovery section keys to human-readable titles.
 *
 * These labels are authoritative for the UI and should always be used
 * in favor of title strings returned from the backend response.
 */
export const DISCOVERY_SECTION_TITLES: {
  [key in DiscoverySectionKey]: string
} = {
  [DiscoverySectionKey.FEATURED]: 'Featured',
  [DiscoverySectionKey.TRENDING]: 'Trending',
  [DiscoverySectionKey.TOP_RATED]: 'Top Rated',
  [DiscoverySectionKey.MOST_PLAYED]: 'Most Played',
  [DiscoverySectionKey.NEW_AND_NOTEWORTHY]: 'New & Noteworthy',
  [DiscoverySectionKey.CATEGORY_SPOTLIGHT]: 'Category Spotlight',
}

/**
 * Client-side mapping of discovery section keys to descriptive subtitles.
 *
 * These descriptions are authoritative for the UI and should always be
 * used in favor of description strings returned from the backend response.
 */
export const DISCOVERY_SECTION_DESCRIPTIONS: {
  [key in DiscoverySectionKey]: string
} = {
  [DiscoverySectionKey.FEATURED]:
    'Handpicked quizzes we think you\u2019ll love',
  [DiscoverySectionKey.TRENDING]: 'Quizzes that are gaining popularity fast',
  [DiscoverySectionKey.TOP_RATED]: 'Highest rated quizzes by players',
  [DiscoverySectionKey.MOST_PLAYED]: 'Quizzes with the most plays',
  [DiscoverySectionKey.NEW_AND_NOTEWORTHY]:
    'Recently published quizzes worth checking out',
  [DiscoverySectionKey.CATEGORY_SPOTLIGHT]:
    'Top quizzes from a specific category',
}
