import { DiscoverySectionKey, QuizCategory } from '@klurigo/common'

import { GameRepository } from '../../game-core/repositories'
import { QuizRepository } from '../../quiz-core/repositories'
import type { Quiz } from '../../quiz-core/repositories/models/schemas'
import {
  DISCOVERY_RAIL_CAP_FEATURED,
  DISCOVERY_RAIL_CAP_STANDARD,
} from '../constants'
import { DiscoverySnapshotRepository } from '../repositories'
import type { DiscoverySnapshotSection } from '../repositories/models/schemas'

import { DiscoveryComputeService } from './discovery-compute.service'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let nextId = 0
const makeQuiz = (overrides: Partial<Quiz> = {}): Quiz => {
  const id = `quiz-${++nextId}`
  return {
    _id: id,
    title: `Quiz ${id}`,
    description: 'A sufficiently long quiz description for eligibility tests',
    visibility: 'PUBLIC',
    category: QuizCategory.Science,
    imageCoverURL: 'https://example.com/cover.jpg',
    languageCode: 'EN',
    questions: Array.from({ length: 10 }, (_, i) => ({ _id: `q${i}` })),
    gameplaySummary: {
      count: 0,
      totalPlayerCount: 0,
      totalClassicCorrectCount: 0,
      totalClassicIncorrectCount: 0,
      totalClassicUnansweredCount: 0,
      totalZeroToOneHundredPrecisionSum: 0,
      totalZeroToOneHundredAnsweredCount: 0,
      totalZeroToOneHundredUnansweredCount: 0,
    },
    ratingSummary: { count: 0, avg: 0, stars: {}, commentCount: 0 },
    created: new Date('2025-01-01'),
    updated: new Date('2025-01-01'),
    ...overrides,
  } as unknown as Quiz
}

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const createMockQuizRepository = () =>
  ({
    findEligiblePublicQuizzes: jest.fn().mockResolvedValue([]),
  }) as unknown as jest.Mocked<QuizRepository>

const createMockGameRepository = () =>
  ({
    findRecentGameStats: jest.fn().mockResolvedValue([]),
  }) as unknown as jest.Mocked<GameRepository>

const createMockSnapshotRepository = () =>
  ({
    upsertLatest: jest.fn().mockResolvedValue(undefined),
  }) as unknown as jest.Mocked<DiscoverySnapshotRepository>

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe(DiscoveryComputeService.name, () => {
  let quizRepo: jest.Mocked<QuizRepository>
  let gameRepo: jest.Mocked<GameRepository>
  let snapshotRepo: jest.Mocked<DiscoverySnapshotRepository>
  let service: DiscoveryComputeService

  beforeEach(() => {
    nextId = 0
    quizRepo = createMockQuizRepository()
    gameRepo = createMockGameRepository()
    snapshotRepo = createMockSnapshotRepository()
    service = new DiscoveryComputeService(quizRepo, gameRepo, snapshotRepo)
  })

  // Helper to extract a section by key from the upserted snapshot
  const getSection = (
    key: DiscoverySectionKey,
  ): DiscoverySnapshotSection | undefined => {
    const call = snapshotRepo.upsertLatest.mock.calls[0]
    const sections: DiscoverySnapshotSection[] = call[0].sections
    return sections.find((s) => s.key === key)
  }

  const getSectionEntryIds = (key: DiscoverySectionKey): string[] => {
    const section = getSection(key)
    return section?.entries.map((e) => e.quizId) ?? []
  }

  // -----------------------------------------------------------------------
  // FEATURED ordering
  // -----------------------------------------------------------------------
  describe('FEATURED ordering', () => {
    it('places featuredRank quizzes first (asc), then unranked by quality; capped to DISCOVERY_RAIL_CAP_FEATURED', async () => {
      const ranked2 = makeQuiz({
        discovery: { featuredRank: 2 },
        gameplaySummary: { count: 100, totalPlayerCount: 50 } as never,
      })
      const ranked1 = makeQuiz({
        discovery: { featuredRank: 1 },
        gameplaySummary: { count: 50, totalPlayerCount: 20 } as never,
      })
      const unrankedHigh = makeQuiz({
        gameplaySummary: { count: 500, totalPlayerCount: 200 } as never,
        ratingSummary: { count: 100, avg: 4.5 } as never,
      })
      const unrankedLow = makeQuiz({
        gameplaySummary: { count: 1, totalPlayerCount: 1 } as never,
      })

      const quizzes = [ranked2, ranked1, unrankedHigh, unrankedLow]
      quizRepo.findEligiblePublicQuizzes.mockResolvedValueOnce(quizzes)

      await service.compute()

      const featured = getSection(DiscoverySectionKey.FEATURED)
      expect(featured).toBeDefined()
      const ids = featured!.entries.map((e) => e.quizId)

      // Ranked quizzes first: rank 1 before rank 2
      expect(ids[0]).toBe(ranked1._id)
      expect(ids[1]).toBe(ranked2._id)

      // Then unranked by quality (higher quality first)
      expect(ids[2]).toBe(unrankedHigh._id)
      expect(ids[3]).toBe(unrankedLow._id)

      expect(featured!.entries.length).toBeLessThanOrEqual(
        DISCOVERY_RAIL_CAP_FEATURED,
      )
    })

    it('caps FEATURED entries at DISCOVERY_RAIL_CAP_FEATURED', async () => {
      // Create more quizzes than the cap
      const quizzes = Array.from(
        { length: DISCOVERY_RAIL_CAP_FEATURED + 5 },
        (_, i) => makeQuiz({ discovery: { featuredRank: i + 1 } }),
      )

      quizRepo.findEligiblePublicQuizzes.mockResolvedValueOnce(quizzes)

      await service.compute()

      const featured = getSection(DiscoverySectionKey.FEATURED)
      expect(featured!.entries.length).toBe(DISCOVERY_RAIL_CAP_FEATURED)
    })
  })

  // -----------------------------------------------------------------------
  // Exclusive dedupe
  // -----------------------------------------------------------------------
  describe('exclusive dedupe', () => {
    it('a featured quiz does not appear in trending or any other rail', async () => {
      const featuredQuiz = makeQuiz({
        discovery: { featuredRank: 1 },
        gameplaySummary: { count: 9999, totalPlayerCount: 5000 } as never,
        ratingSummary: { count: 500, avg: 5.0 } as never,
      })

      const otherQuiz = makeQuiz({
        gameplaySummary: { count: 10, totalPlayerCount: 5 } as never,
      })

      quizRepo.findEligiblePublicQuizzes.mockResolvedValueOnce([
        featuredQuiz,
        otherQuiz,
      ])
      gameRepo.findRecentGameStats.mockResolvedValueOnce([
        { quizId: featuredQuiz._id, playCount: 1000 },
      ])

      await service.compute()

      const featuredIds = getSectionEntryIds(DiscoverySectionKey.FEATURED)
      expect(featuredIds).toContain(featuredQuiz._id)

      // Should not appear in any other rail
      for (const key of [
        DiscoverySectionKey.TRENDING,
        DiscoverySectionKey.TOP_RATED,
        DiscoverySectionKey.MOST_PLAYED,
        DiscoverySectionKey.NEW_AND_NOTEWORTHY,
        DiscoverySectionKey.CATEGORY_SPOTLIGHT,
      ]) {
        expect(getSectionEntryIds(key)).not.toContain(featuredQuiz._id)
      }
    })

    it('a trending quiz does not appear in most_played', async () => {
      // Create many quizzes so the trending quiz doesn't also land in FEATURED
      const trendingQuiz = makeQuiz({
        gameplaySummary: { count: 500, totalPlayerCount: 200 } as never,
      })
      // Fill FEATURED cap so trendingQuiz is pushed out
      const featuredFillers = Array.from(
        { length: DISCOVERY_RAIL_CAP_FEATURED },
        (_, i) => makeQuiz({ discovery: { featuredRank: i + 1 } }),
      )

      quizRepo.findEligiblePublicQuizzes.mockResolvedValueOnce([
        ...featuredFillers,
        trendingQuiz,
      ])
      gameRepo.findRecentGameStats.mockResolvedValueOnce([
        { quizId: trendingQuiz._id, playCount: 5000 },
      ])

      await service.compute()

      const trendingIds = getSectionEntryIds(DiscoverySectionKey.TRENDING)
      expect(trendingIds).toContain(trendingQuiz._id)

      const mostPlayedIds = getSectionEntryIds(DiscoverySectionKey.MOST_PLAYED)
      expect(mostPlayedIds).not.toContain(trendingQuiz._id)
    })
  })

  // -----------------------------------------------------------------------
  // Soft dedupe overlap
  // -----------------------------------------------------------------------
  describe('soft dedupe overlap', () => {
    it('a quiz can appear in both MOST_PLAYED and NEW_AND_NOTEWORTHY if not claimed by exclusive rails', async () => {
      const sharedQuiz = makeQuiz({
        gameplaySummary: { count: 100, totalPlayerCount: 50 } as never,
        created: new Date('2026-01-15'),
        category: QuizCategory.History,
      })

      // Fill exclusive rails so sharedQuiz is excluded from them
      const featuredFillers = Array.from(
        { length: DISCOVERY_RAIL_CAP_FEATURED },
        (_, i) =>
          makeQuiz({
            discovery: { featuredRank: i + 1 },
            category: QuizCategory.Science,
          }),
      )
      // Give trending fillers high recent play counts
      const trendingFillers = Array.from(
        { length: DISCOVERY_RAIL_CAP_STANDARD },
        () =>
          makeQuiz({
            ratingSummary: { count: 200, avg: 4.8 } as never,
            category: QuizCategory.Science,
          }),
      )

      const allQuizzes = [...featuredFillers, ...trendingFillers, sharedQuiz]
      quizRepo.findEligiblePublicQuizzes.mockResolvedValueOnce(allQuizzes)

      // Give trending fillers high recent plays so they fill trending
      const trendingStats = trendingFillers.map((q, i) => ({
        quizId: q._id,
        playCount: 9000 - i,
      }))
      gameRepo.findRecentGameStats.mockResolvedValueOnce(trendingStats)

      await service.compute()

      // sharedQuiz should not be in any exclusive rail
      for (const key of [
        DiscoverySectionKey.FEATURED,
        DiscoverySectionKey.TRENDING,
        DiscoverySectionKey.TOP_RATED,
      ]) {
        expect(getSectionEntryIds(key)).not.toContain(sharedQuiz._id)
      }

      // But should be in soft rails
      const mostPlayed = getSectionEntryIds(DiscoverySectionKey.MOST_PLAYED)
      const newNoteworthy = getSectionEntryIds(
        DiscoverySectionKey.NEW_AND_NOTEWORTHY,
      )

      expect(mostPlayed).toContain(sharedQuiz._id)
      expect(newNoteworthy).toContain(sharedQuiz._id)
    })
  })

  // -----------------------------------------------------------------------
  // Caps
  // -----------------------------------------------------------------------
  describe('section caps', () => {
    it('standard rails are capped at DISCOVERY_RAIL_CAP_STANDARD', async () => {
      const quizzes = Array.from(
        { length: DISCOVERY_RAIL_CAP_STANDARD + 10 },
        () => makeQuiz(),
      )
      quizRepo.findEligiblePublicQuizzes.mockResolvedValueOnce(quizzes)

      await service.compute()

      for (const key of [
        DiscoverySectionKey.TRENDING,
        DiscoverySectionKey.TOP_RATED,
        DiscoverySectionKey.MOST_PLAYED,
        DiscoverySectionKey.NEW_AND_NOTEWORTHY,
        DiscoverySectionKey.CATEGORY_SPOTLIGHT,
      ]) {
        const section = getSection(key)
        if (section) {
          expect(section.entries.length).toBeLessThanOrEqual(
            DISCOVERY_RAIL_CAP_STANDARD,
          )
        }
      }
    })
  })

  // -----------------------------------------------------------------------
  // Entries ordering (descending by score)
  // -----------------------------------------------------------------------
  describe('entries ordering', () => {
    it('each section stores entries in descending score order', async () => {
      const quizzes = [
        makeQuiz({
          gameplaySummary: { count: 100, totalPlayerCount: 50 } as never,
          ratingSummary: { count: 50, avg: 4.5 } as never,
        }),
        makeQuiz({
          gameplaySummary: { count: 500, totalPlayerCount: 200 } as never,
          ratingSummary: { count: 200, avg: 3.0 } as never,
        }),
        makeQuiz({
          gameplaySummary: { count: 10, totalPlayerCount: 5 } as never,
          ratingSummary: { count: 5, avg: 5.0 } as never,
        }),
      ]
      quizRepo.findEligiblePublicQuizzes.mockResolvedValueOnce(quizzes)
      gameRepo.findRecentGameStats.mockResolvedValueOnce([
        { quizId: quizzes[0]._id, playCount: 10 },
        { quizId: quizzes[1]._id, playCount: 50 },
      ])

      await service.compute()

      const call = snapshotRepo.upsertLatest.mock.calls[0]
      const sections: DiscoverySnapshotSection[] = call[0].sections

      for (const section of sections) {
        for (let i = 1; i < section.entries.length; i++) {
          expect(section.entries[i - 1].score).toBeGreaterThanOrEqual(
            section.entries[i].score,
          )
        }
      }
    })
  })

  // -----------------------------------------------------------------------
  // Missing stats → playCount 0
  // -----------------------------------------------------------------------
  describe('missing recent stats', () => {
    it('quizzes with no game stats get recentPlayCount 0 in trending', async () => {
      // Provide enough quizzes with one having a featured rank so the
      // quiz-under-test doesn't get claimed by FEATURED before TRENDING
      const quiz = makeQuiz()
      const featuredFillers = Array.from(
        { length: DISCOVERY_RAIL_CAP_FEATURED },
        (_, i) => makeQuiz({ discovery: { featuredRank: i + 1 } }),
      )
      quizRepo.findEligiblePublicQuizzes.mockResolvedValueOnce([
        ...featuredFillers,
        quiz,
      ])
      // No game stats returned
      gameRepo.findRecentGameStats.mockResolvedValueOnce([])

      await service.compute()

      const trending = getSection(DiscoverySectionKey.TRENDING)
      expect(trending).toBeDefined()
      // Score should be 0 (no recent plays)
      const entry = trending!.entries.find((e) => e.quizId === quiz._id)
      expect(entry?.score).toBe(0)
    })
  })

  // -----------------------------------------------------------------------
  // Trending stats influence
  // -----------------------------------------------------------------------
  describe('trending stats influence', () => {
    it('a quiz with non-zero recent stats scores higher in TRENDING than one without', async () => {
      // Fill FEATURED so test quizzes don't land there
      const featuredFillers = Array.from(
        { length: DISCOVERY_RAIL_CAP_FEATURED },
        (_, i) => makeQuiz({ discovery: { featuredRank: i + 1 } }),
      )

      const quizWithStats = makeQuiz()
      const quizWithoutStats = makeQuiz()

      quizRepo.findEligiblePublicQuizzes.mockResolvedValueOnce([
        ...featuredFillers,
        quizWithStats,
        quizWithoutStats,
      ])
      gameRepo.findRecentGameStats.mockResolvedValueOnce([
        { quizId: quizWithStats._id, playCount: 100 },
      ])

      await service.compute()

      const trending = getSection(DiscoverySectionKey.TRENDING)
      expect(trending).toBeDefined()

      const entryWith = trending!.entries.find(
        (e) => e.quizId === quizWithStats._id,
      )
      const entryWithout = trending!.entries.find(
        (e) => e.quizId === quizWithoutStats._id,
      )

      expect(entryWith).toBeDefined()
      expect(entryWithout).toBeDefined()
      expect(entryWith!.score).toBeGreaterThan(entryWithout!.score)
    })
  })

  // -----------------------------------------------------------------------
  // Empty input
  // -----------------------------------------------------------------------
  describe('empty input', () => {
    it('produces an empty snapshot when no eligible quizzes exist', async () => {
      quizRepo.findEligiblePublicQuizzes.mockResolvedValueOnce([])

      await service.compute()

      expect(snapshotRepo.upsertLatest).toHaveBeenCalledWith(
        expect.objectContaining({ sections: [] }),
      )
    })
  })

  // -----------------------------------------------------------------------
  // Batch iteration
  // -----------------------------------------------------------------------
  describe('batch iteration', () => {
    it('fetches multiple batches until a batch returns fewer than 500', async () => {
      const batch1 = Array.from({ length: 500 }, () => makeQuiz())
      const batch2 = Array.from({ length: 100 }, () => makeQuiz())

      quizRepo.findEligiblePublicQuizzes
        .mockResolvedValueOnce(batch1)
        .mockResolvedValueOnce(batch2)

      await service.compute()

      expect(quizRepo.findEligiblePublicQuizzes).toHaveBeenCalledTimes(2)
      expect(quizRepo.findEligiblePublicQuizzes).toHaveBeenCalledWith(0, 500)
      expect(quizRepo.findEligiblePublicQuizzes).toHaveBeenCalledWith(500, 500)
    })
  })
})
