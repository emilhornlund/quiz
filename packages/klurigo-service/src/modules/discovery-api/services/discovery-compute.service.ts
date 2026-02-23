import { DiscoverySectionKey, QuizCategory } from '@klurigo/common'
import { Injectable } from '@nestjs/common'

import { GameRepository } from '../../game-core/repositories'
import { QuizRepository } from '../../quiz-core/repositories'
import { Quiz } from '../../quiz-core/repositories/models/schemas'
import {
  computeBayesianRatingScore,
  computeQualityScore,
  computeTrendingScore,
  MIN_RATING_COUNT,
  type RecentActivityStats,
  TRENDING_WINDOW_DAYS,
} from '../../quiz-core/utils'
import {
  DISCOVERY_RAIL_CAP_FEATURED,
  DISCOVERY_RAIL_CAP_STANDARD,
} from '../constants'
import { DiscoverySnapshotRepository } from '../repositories'
import type { DiscoverySnapshotSection } from '../repositories/models/schemas'

/** Batch size used when paginating through eligible quizzes. */
const ELIGIBLE_QUIZ_BATCH_SIZE = 500

/**
 * Base score added to FEATURED entries that have an explicit `featuredRank`.
 *
 * The snapshot invariant requires entries to be stored in descending score
 * order. FEATURED's primary ordering, however, is `featuredRank` ascending
 * (lower rank = higher priority). To reconcile the two, ranked entries
 * receive `FEATURED_RANK_BASE_SCORE - featuredRank` as their score. This
 * guarantees that:
 *
 * 1. All ranked entries sort ahead of unranked entries (whose score is a
 *    quality score in [0, 100], always below `FEATURED_RANK_BASE_SCORE`).
 * 2. Among ranked entries, a lower `featuredRank` produces a higher score
 *    (e.g., rank 1 → 9999, rank 2 → 9998), preserving ascending-rank
 *    ordering when sorted descending by score.
 */
const FEATURED_RANK_BASE_SCORE = 10_000

/**
 * Compute pipeline that builds a complete discovery snapshot.
 *
 * The pipeline executes the following steps in order:
 *
 * 1. **Fetch eligible quizzes** — paginate through all public quizzes that
 *    pass the discovery eligibility criteria (cover, description, question
 *    count) in batches of 500.
 * 2. **Gather recent-activity stats** — query `GameRepository` for per-quiz
 *    play counts within the trailing `TRENDING_WINDOW_DAYS` days and build
 *    an O(1) lookup map. Quizzes with no recent activity receive
 *    `{ recentPlayCount: 0 }`.
 *    Future enhancement: once the data model supports it, incorporate
 *    unique-player counts (`recentUniquePlayerCount`) for additional
 *    trending signal.
 * 3. **Compute global Bayesian mean** — average star rating across all
 *    eligible quizzes, used as the `globalMean` input for quality and
 *    Bayesian scoring.
 * 4. **Score all rails** — for each `DiscoverySectionKey`, produce a ranked
 *    list of `{ quizId, score }` entries capped at the rail-specific limit.
 * 5. **Apply dedupe policy** — hard-exclusive rails (`FEATURED`, `TRENDING`,
 *    `TOP_RATED`) claim quizzes in priority order so that a quiz appears in
 *    at most one exclusive rail. Soft-deduped rails (`MOST_PLAYED`,
 *    `NEW_AND_NOTEWORTHY`, `CATEGORY_SPOTLIGHT`) remove exclusive-claimed
 *    quizzes but allow overlap among themselves. This maximises variety at
 *    the top while tolerating some repetition in secondary sections.
 * 6. **Persist** — upsert the singleton snapshot document with the scored,
 *    deduped sections and a `generatedAt` timestamp.
 */
@Injectable()
export class DiscoveryComputeService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly gameRepository: GameRepository,
    private readonly snapshotRepository: DiscoverySnapshotRepository,
  ) {}

  /**
   * Executes the full discovery compute pipeline.
   *
   * Steps:
   * 1. Fetch all eligible quizzes in batches of 500.
   * 2. Gather recent game stats for trending (O(1) map lookup per quiz).
   * 3. Compute global Bayesian mean from eligible quizzes.
   * 4. Score each rail and cap entries.
   * 5. Apply hard-exclusive then soft-dedupe policy.
   * 6. Upsert the discovery snapshot.
   *
   * Side effects: replaces the singleton discovery snapshot document.
   */
  async compute(): Promise<void> {
    // Step 1: Fetch eligible quizzes in batches
    const eligibleQuizzes = await this.fetchAllEligibleQuizzes()

    if (eligibleQuizzes.length === 0) {
      await this.snapshotRepository.upsertLatest({
        generatedAt: new Date(),
        sections: [],
      })
      return
    }

    // Step 2: Gather recent-activity stats for trending
    const recentStatsMap = await this.buildRecentStatsMap()

    // Step 3: Compute global Bayesian mean
    const globalMean = this.computeGlobalMean(eligibleQuizzes)

    // Step 4: Score all rails
    const rawSections = this.scoreAllRails(
      eligibleQuizzes,
      recentStatsMap,
      globalMean,
    )

    // Step 5: Apply dedupe policy
    const dedupedSections = this.applyDedupePolicy(rawSections)

    // Step 6: Persist
    const nonEmptySections = dedupedSections.filter((s) => s.entries.length > 0)
    await this.snapshotRepository.upsertLatest({
      generatedAt: new Date(),
      sections: nonEmptySections,
    })
  }

  private async fetchAllEligibleQuizzes(): Promise<Quiz[]> {
    const allQuizzes: Quiz[] = []
    let offset = 0

    while (true) {
      const batch = await this.quizRepository.findEligiblePublicQuizzes(
        offset,
        ELIGIBLE_QUIZ_BATCH_SIZE,
      )
      allQuizzes.push(...batch)
      if (batch.length < ELIGIBLE_QUIZ_BATCH_SIZE) break
      offset += ELIGIBLE_QUIZ_BATCH_SIZE
    }

    return allQuizzes
  }

  private async buildRecentStatsMap(): Promise<
    Map<string, RecentActivityStats>
  > {
    const stats =
      await this.gameRepository.findRecentGameStats(TRENDING_WINDOW_DAYS)
    const map = new Map<string, RecentActivityStats>()
    for (const entry of stats) {
      map.set(entry.quizId, { recentPlayCount: entry.playCount })
    }
    return map
  }

  private computeGlobalMean(quizzes: Quiz[]): number {
    let totalRating = 0
    let totalCount = 0
    for (const quiz of quizzes) {
      const count = quiz.ratingSummary?.count ?? 0
      const avg = quiz.ratingSummary?.avg ?? 0
      totalRating += avg * count
      totalCount += count
    }
    return totalCount > 0 ? totalRating / totalCount : 0
  }

  private scoreAllRails(
    quizzes: Quiz[],
    recentStatsMap: Map<string, RecentActivityStats>,
    globalMean: number,
  ): Map<DiscoverySectionKey, Array<{ quizId: string; score: number }>> {
    const sections = new Map<
      DiscoverySectionKey,
      Array<{ quizId: string; score: number }>
    >()

    sections.set(
      DiscoverySectionKey.FEATURED,
      this.scoreFeatured(quizzes, globalMean),
    )
    sections.set(
      DiscoverySectionKey.TRENDING,
      this.scoreTrending(quizzes, recentStatsMap),
    )
    sections.set(
      DiscoverySectionKey.TOP_RATED,
      this.scoreTopRated(quizzes, globalMean),
    )
    sections.set(DiscoverySectionKey.MOST_PLAYED, this.scoreMostPlayed(quizzes))
    sections.set(
      DiscoverySectionKey.NEW_AND_NOTEWORTHY,
      this.scoreNewAndNoteworthy(quizzes, globalMean),
    )
    sections.set(
      DiscoverySectionKey.CATEGORY_SPOTLIGHT,
      this.scoreCategorySpotlight(quizzes, globalMean),
    )

    return sections
  }

  /**
   * Scores the FEATURED rail.
   *
   * Primary ordering: quizzes with `discovery.featuredRank` set, sorted
   * ascending by `featuredRank` (lower rank = higher priority). Ties among
   * ranked quizzes are broken by quality score descending.
   *
   * Remaining slots (up to `DISCOVERY_RAIL_CAP_FEATURED`) are filled with
   * unranked quizzes sorted by quality score descending.
   *
   * To satisfy the snapshot invariant (entries stored descending by score),
   * ranked entries receive a synthetic score of
   * `FEATURED_RANK_BASE_SCORE - featuredRank`, which is always greater than
   * any quality score (0–100). Unranked entries use their quality score
   * directly. This mapping preserves the desired ordering: ranked entries
   * sort ahead of unranked, and among ranked entries lower ranks produce
   * higher scores.
   */
  private scoreFeatured(
    quizzes: Quiz[],
    globalMean: number,
  ): Array<{ quizId: string; score: number }> {
    const ranked: Array<{
      quiz: Quiz
      featuredRank: number
      qualityScore: number
    }> = []
    const unranked: Array<{ quiz: Quiz; qualityScore: number }> = []

    for (const quiz of quizzes) {
      const qualityScore = computeQualityScore(
        quiz,
        globalMean,
        MIN_RATING_COUNT,
      )
      if (quiz.discovery?.featuredRank != null) {
        ranked.push({
          quiz,
          featuredRank: quiz.discovery.featuredRank,
          qualityScore,
        })
      } else {
        unranked.push({ quiz, qualityScore })
      }
    }

    ranked.sort(
      (a, b) =>
        a.featuredRank - b.featuredRank || b.qualityScore - a.qualityScore,
    )
    unranked.sort((a, b) => b.qualityScore - a.qualityScore)

    const entries: Array<{ quizId: string; score: number }> = []

    for (const r of ranked) {
      if (entries.length >= DISCOVERY_RAIL_CAP_FEATURED) break
      entries.push({
        quizId: r.quiz._id,
        score: FEATURED_RANK_BASE_SCORE - r.featuredRank,
      })
    }

    for (const u of unranked) {
      if (entries.length >= DISCOVERY_RAIL_CAP_FEATURED) break
      entries.push({
        quizId: u.quiz._id,
        score: u.qualityScore,
      })
    }

    return entries
  }

  private scoreTrending(
    quizzes: Quiz[],
    recentStatsMap: Map<string, RecentActivityStats>,
  ): Array<{ quizId: string; score: number }> {
    const scored = quizzes.map((quiz) => {
      const stats = recentStatsMap.get(quiz._id) ?? { recentPlayCount: 0 }
      return {
        quizId: quiz._id,
        score: computeTrendingScore(stats),
      }
    })

    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, DISCOVERY_RAIL_CAP_STANDARD)
  }

  private scoreTopRated(
    quizzes: Quiz[],
    globalMean: number,
  ): Array<{ quizId: string; score: number }> {
    const scored = quizzes.map((quiz) => ({
      quizId: quiz._id,
      score: computeBayesianRatingScore(quiz, globalMean, MIN_RATING_COUNT),
    }))

    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, DISCOVERY_RAIL_CAP_STANDARD)
  }

  private scoreMostPlayed(
    quizzes: Quiz[],
  ): Array<{ quizId: string; score: number }> {
    const scored = quizzes.map((quiz) => ({
      quizId: quiz._id,
      score: quiz.gameplaySummary?.count ?? 0,
    }))

    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, DISCOVERY_RAIL_CAP_STANDARD)
  }

  private scoreNewAndNoteworthy(
    quizzes: Quiz[],
    globalMean: number,
  ): Array<{ quizId: string; score: number }> {
    const withTimestamps = quizzes.map((quiz) => ({
      quiz,
      createdMs: quiz.created.getTime(),
      qualityScore: computeQualityScore(quiz, globalMean, MIN_RATING_COUNT),
    }))

    withTimestamps.sort(
      (a, b) => b.createdMs - a.createdMs || b.qualityScore - a.qualityScore,
    )

    // Use a combined score that preserves ordering: created timestamp as
    // primary (larger ms = newer = higher rank), quality as tie-breaker.
    // The score stored is the quality score since timestamp ordering is
    // already captured by array position, but for observability we encode
    // both signals: epoch-seconds plus fractional quality.
    return withTimestamps
      .slice(0, DISCOVERY_RAIL_CAP_STANDARD)
      .map((entry) => ({
        quizId: entry.quiz._id,
        score: entry.createdMs / 1000 + entry.qualityScore / 1000,
      }))
  }

  private scoreCategorySpotlight(
    quizzes: Quiz[],
    globalMean: number,
  ): Array<{ quizId: string; score: number }> {
    // Pick the category with the most eligible quizzes
    const categoryCounts = new Map<QuizCategory, number>()
    for (const quiz of quizzes) {
      const cat = quiz.category
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1)
    }

    if (categoryCounts.size === 0) return []

    let topCategory: QuizCategory = quizzes[0].category
    let topCount = 0
    for (const [cat, count] of categoryCounts) {
      if (count > topCount) {
        topCount = count
        topCategory = cat
      }
    }

    const categoryQuizzes = quizzes.filter((q) => q.category === topCategory)
    const scored = categoryQuizzes.map((quiz) => ({
      quizId: quiz._id,
      score: computeQualityScore(quiz, globalMean, MIN_RATING_COUNT),
    }))

    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, DISCOVERY_RAIL_CAP_STANDARD)
  }

  private applyDedupePolicy(
    rawSections: Map<
      DiscoverySectionKey,
      Array<{ quizId: string; score: number }>
    >,
  ): DiscoverySnapshotSection[] {
    const claimed = new Set<string>()

    // Hard-exclusive rails processed in priority order
    const exclusiveKeys = [
      DiscoverySectionKey.FEATURED,
      DiscoverySectionKey.TRENDING,
      DiscoverySectionKey.TOP_RATED,
    ] as const

    const result: DiscoverySnapshotSection[] = []

    for (const key of exclusiveKeys) {
      const entries = rawSections.get(key) ?? []
      const deduped = entries.filter((e) => !claimed.has(e.quizId))
      for (const e of deduped) {
        claimed.add(e.quizId)
      }
      result.push({ key, entries: deduped })
    }

    // Soft-deduped rails: remove exclusive-claimed, allow overlap among each other
    const softKeys = [
      DiscoverySectionKey.MOST_PLAYED,
      DiscoverySectionKey.NEW_AND_NOTEWORTHY,
      DiscoverySectionKey.CATEGORY_SPOTLIGHT,
    ] as const

    for (const key of softKeys) {
      const entries = rawSections.get(key) ?? []
      const deduped = entries.filter((e) => !claimed.has(e.quizId))
      result.push({ key, entries: deduped })
    }

    return result
  }
}
