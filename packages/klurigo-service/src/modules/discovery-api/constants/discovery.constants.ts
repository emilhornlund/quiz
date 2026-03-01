/**
 * Fixed UUID `_id` used to identify the singleton discovery snapshot document.
 *
 * Only one document ever exists in the `discovery_snapshots` collection. Using
 * a well-known fixed UUID (instead of generating a new UUID each run) ensures
 * that `findOneAndReplace` upserts reliably target the same document every run,
 * and makes the uniqueness guarantee free (covered by the default `_id` index).
 */
export const DISCOVERY_SNAPSHOT_SINGLETON_ID =
  '00000000-0000-0000-0000-000000000000'

/**
 * Maximum number of entries stored per snapshot for the FEATURED rail.
 *
 * The FEATURED rail is manually curated (via `discovery.featuredRank` on the
 * Quiz document), so a smaller cap than `DISCOVERY_RAIL_CAP_STANDARD` is
 * appropriate. Any entries beyond this limit are dropped at write time.
 */
export const DISCOVERY_RAIL_CAP_FEATURED = 20

/**
 * Maximum number of entries stored per snapshot for all non-FEATURED rails
 * (TRENDING, TOP_RATED, MOST_PLAYED, NEW_AND_NOTEWORTHY, CATEGORY_SPOTLIGHT).
 *
 * Large enough to give "see all" meaningful depth while keeping snapshot
 * documents a manageable size.
 */
export const DISCOVERY_RAIL_CAP_STANDARD = 200

/**
 * Number of entries sliced from the snapshot to populate the rail card row
 * in `GET /discover`.
 *
 * Only the first `DISCOVERY_RAIL_PREVIEW_SIZE` entries from each section are
 * hydrated and returned in the discovery page response; the remainder is
 * reserved for the "see all" paginated view.
 */
export const DISCOVERY_RAIL_PREVIEW_SIZE = 10
