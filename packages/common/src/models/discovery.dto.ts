import { GameMode } from './game-mode.enum'
import { LanguageCode } from './language-code.enum'
import {
  QuizAuthorResponseDto,
  QuizCategory,
  QuizGameplaySummaryDto,
  QuizRatingSummaryDto,
} from './quiz.dto'

/**
 * Identifies a discovery rail (section) by its algorithmic intent.
 *
 * Each key corresponds to a distinct curation strategy computed server-side
 * on a fixed schedule. The key is stable across releases and is safe to
 * persist or reference in client-side routing.
 */
export enum DiscoverySectionKey {
  /**
   * Hand-picked or highest-quality quizzes prominently placed at the top of
   * the discovery page.
   */
  FEATURED = 'FEATURED',

  /**
   * Quizzes with the highest recent-play activity within a rolling time window.
   */
  TRENDING = 'TRENDING',

  /**
   * Quizzes ranked by Bayesian-adjusted average star rating.
   */
  TOP_RATED = 'TOP_RATED',

  /**
   * Quizzes with the highest cumulative play count across all time.
   */
  MOST_PLAYED = 'MOST_PLAYED',

  /**
   * Recently published quizzes that have passed the eligibility quality bar.
   */
  NEW_AND_NOTEWORTHY = 'NEW_AND_NOTEWORTHY',

  /**
   * A rotating spotlight on a single quiz category, surfacing the best
   * quizzes in that category at the time of snapshot computation.
   */
  CATEGORY_SPOTLIGHT = 'CATEGORY_SPOTLIGHT',
}

/**
 * Lightweight quiz representation used inside discovery rails.
 *
 * Contains only the fields required to render a quiz card in the discovery
 * UI. It intentionally omits fields that are irrelevant at browse time
 * (e.g. visibility, individual questions, updated timestamp).
 */
export type DiscoveryQuizCardDto = {
  /**
   * The unique identifier of the quiz.
   */
  readonly id: string

  /**
   * The display title of the quiz.
   */
  readonly title: string

  /**
   * A short description of the quiz content.
   */
  readonly description?: string

  /**
   * URL of the quiz cover image.
   *
   * All discovery-eligible quizzes are guaranteed to have a non-empty value.
   */
  readonly imageCoverURL?: string

  /**
   * The subject category of the quiz.
   */
  readonly category: QuizCategory

  /**
   * BCP 47-style language code indicating the primary language of the quiz.
   */
  readonly languageCode: LanguageCode

  /**
   * The game mode the quiz is played in.
   */
  readonly mode: GameMode

  /**
   * Total number of questions in the quiz.
   */
  readonly numberOfQuestions: number

  /**
   * Author metadata for attribution display.
   */
  readonly author: QuizAuthorResponseDto

  /**
   * Aggregated gameplay statistics (play counts, last played, difficulty).
   */
  readonly gameplaySummary: QuizGameplaySummaryDto

  /**
   * Aggregated rating information (average stars, comment count).
   */
  readonly ratingSummary: QuizRatingSummaryDto

  /**
   * Timestamp of when the quiz was originally created.
   */
  readonly created: Date
}

/**
 * A single horizontal discovery rail containing a curated list of quizzes.
 *
 * The rail is identified by its key, which determines the curation algorithm
 * used to populate it. The title and optional description are display strings
 * localized or formatted by the backend before delivery.
 */
export type DiscoverySectionDto = {
  /**
   * The algorithmic identifier for this rail.
   */
  readonly key: DiscoverySectionKey

  /**
   * Human-readable section heading shown above the rail.
   */
  readonly title: string

  /**
   * Optional subtitle or contextual description for the rail.
   *
   * @remarks
   * For CATEGORY_SPOTLIGHT this typically names the featured category.
   */
  readonly description?: string

  /**
   * Ordered list of quiz cards to display in this rail.
   *
   * The ordering reflects the rail's curation algorithm (e.g. by trending
   * score, by rating, by recency).
   */
  readonly quizzes: DiscoveryQuizCardDto[]
}

/**
 * Top-level response payload for the discovery page.
 *
 * Contains all rails to render, ordered as they should appear on screen.
 * The generatedAt timestamp reflects when the snapshot was last computed.
 */
export type DiscoveryResponseDto = {
  /**
   * Ordered list of discovery rails to display.
   */
  readonly sections: DiscoverySectionDto[]

  /**
   * UTC timestamp of the most recent snapshot computation.
   *
   * Null when no snapshot has been computed yet (e.g. first deployment).
   */
  readonly generatedAt: Date | null
}

/**
 * Offset-paginated response for the "see all" view of a single discovery rail.
 *
 * Enables users to browse the full contents of a rail beyond the initial
 * preview shown on the discovery page. Pagination is offset-based to match
 * the conventions of PaginatedQuizResponseDto.
 *
 * @remarks
 * snapshotTotal reflects the number of scored entries stored in the snapshot
 * for this rail. It is bounded by the snapshot capacity constants
 * DISCOVERY_RAIL_CAP_FEATURED (for the FEATURED rail) and
 * DISCOVERY_RAIL_CAP_STANDARD (for all other rails). It is NOT the total number
 * of eligible quizzes in the database, and it may be smaller than the database
 * row count for that rail.
 */
export type DiscoverySectionPageResponseDto = {
  /**
   * The rail identifier this page belongs to.
   */
  readonly key: DiscoverySectionKey

  /**
   * Human-readable section heading, matching the value from DiscoverySectionDto.
   */
  readonly title: string

  /**
   * Ordered quiz cards for the current page.
   *
   * @remarks
   * The field is named results (not quizzes) to match the PaginatedQuizResponseDto
   * convention used elsewhere in the API.
   */
  readonly results: DiscoveryQuizCardDto[]

  /**
   * Total number of entries stored in the snapshot for this rail.
   *
   * This value is bounded by snapshot capacity constants
   * (DISCOVERY_RAIL_CAP_FEATURED / DISCOVERY_RAIL_CAP_STANDARD)
   * and is NOT a live database row count. Use it to calculate total pages;
   * do not display it as "total quizzes available" in the database.
   *
   * @example
   * // With snapshotTotal = 50 and limit = 10:
   * // total pages = Math.ceil(50 / 10) = 5
   */
  readonly snapshotTotal: number

  /**
   * Maximum number of quiz cards returned in a single page.
   */
  readonly limit: number

  /**
   * Zero-based index of the first item on this page within the snapshot.
   */
  readonly offset: number
}
