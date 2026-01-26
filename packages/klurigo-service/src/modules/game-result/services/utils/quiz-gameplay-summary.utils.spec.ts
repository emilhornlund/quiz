import { GameMode, QuestionType } from '@klurigo/common'

import {
  createMockClassicGameResultQuestionMetric,
  createMockGameResultDocument,
  createMockGameResultPlayerMetric,
  createMockQuizGameplaySummary,
  createMockZeroToOneHundredGameResultQuestionMetric,
} from '../../../../../test-utils/data'

import { aggregateQuizGameplaySummary } from './quiz-gameplay-summary.utils'

describe('QuizGameplaySummary', () => {
  describe('aggregateQuizGameplaySummary', () => {
    it('aggregates Classic totals and updates global counters', () => {
      const now = new Date('2026-01-26T10:00:00.000Z')
      const completed = new Date('2026-01-26T09:00:00.000Z')

      const existing = createMockQuizGameplaySummary({
        count: 2,
        totalPlayerCount: 10,
        totalClassicCorrectCount: 5,
        totalClassicIncorrectCount: 7,
        totalClassicUnansweredCount: 3,
        totalZeroToOneHundredPrecisionSum: 1.25,
        totalZeroToOneHundredAnsweredCount: 4,
        totalZeroToOneHundredUnansweredCount: 2,
        lastPlayedAt: new Date('2026-01-25T12:00:00.000Z'),
        updated: new Date('2026-01-25T12:00:00.000Z'),
      })

      const gameResult = createMockGameResultDocument({
        players: [
          createMockGameResultPlayerMetric({
            participantId: 'p1',
            nickname: 'A',
            rank: 1,
            comebackRankGain: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 1000,
            longestCorrectStreak: 0,
            score: 10,
          }),
          createMockGameResultPlayerMetric({
            participantId: 'p2',
            nickname: 'B',
            rank: 2,
            comebackRankGain: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 1000,
            longestCorrectStreak: 0,
            score: 8,
          }),
          createMockGameResultPlayerMetric({
            participantId: 'p3',
            nickname: 'C',
            rank: 3,
            comebackRankGain: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 1000,
            longestCorrectStreak: 0,
            score: 6,
          }),
        ],
        questions: [
          createMockClassicGameResultQuestionMetric({
            text: 'Q1',
            type: QuestionType.TrueFalse,
            correct: 2,
            incorrect: 1,
            unanswered: 0,
            averageResponseTime: 500,
          }),
          createMockClassicGameResultQuestionMetric({
            text: 'Q2',
            type: QuestionType.MultiChoice,
            correct: 0,
            incorrect: 1,
            unanswered: 2,
            averageResponseTime: 700,
          }),
        ],
        completed,
      })

      const updated = aggregateQuizGameplaySummary(
        existing,
        gameResult,
        GameMode.Classic,
        now,
      )

      expect(updated).toEqual({
        ...existing,
        count: 3,
        totalPlayerCount: 13,
        totalClassicCorrectCount: 7,
        totalClassicIncorrectCount: 9,
        totalClassicUnansweredCount: 5,
        totalZeroToOneHundredPrecisionSum: 1.25,
        totalZeroToOneHundredAnsweredCount: 4,
        totalZeroToOneHundredUnansweredCount: 2,
        lastPlayedAt: completed,
        updated: now,
      })

      expect(existing).toEqual(
        createMockQuizGameplaySummary({
          count: 2,
          totalPlayerCount: 10,
          totalClassicCorrectCount: 5,
          totalClassicIncorrectCount: 7,
          totalClassicUnansweredCount: 3,
          totalZeroToOneHundredPrecisionSum: 1.25,
          totalZeroToOneHundredAnsweredCount: 4,
          totalZeroToOneHundredUnansweredCount: 2,
          lastPlayedAt: new Date('2026-01-25T12:00:00.000Z'),
          updated: new Date('2026-01-25T12:00:00.000Z'),
        }),
      )
    })

    it('aggregates ZeroToOneHundred attempted-only precision and unanswered totals', () => {
      const now = new Date('2026-01-26T10:00:00.000Z')
      const completed = new Date('2026-01-26T09:00:00.000Z')

      const existing = createMockQuizGameplaySummary({
        count: 0,
        totalPlayerCount: 0,
        totalZeroToOneHundredPrecisionSum: 0,
        totalZeroToOneHundredAnsweredCount: 0,
        totalZeroToOneHundredUnansweredCount: 0,
        lastPlayedAt: undefined,
        updated: new Date('2026-01-25T12:00:00.000Z'),
      })

      const gameResult = createMockGameResultDocument({
        players: [
          createMockGameResultPlayerMetric({
            participantId: 'p1',
            nickname: 'A',
            rank: 1,
            comebackRankGain: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 1000,
            longestCorrectStreak: 0,
            score: 10,
          }),
          createMockGameResultPlayerMetric({
            participantId: 'p2',
            nickname: 'B',
            rank: 2,
            comebackRankGain: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 1000,
            longestCorrectStreak: 0,
            score: 8,
          }),
          createMockGameResultPlayerMetric({
            participantId: 'p3',
            nickname: 'C',
            rank: 3,
            comebackRankGain: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 1000,
            longestCorrectStreak: 0,
            score: 6,
          }),
        ],
        questions: [
          createMockZeroToOneHundredGameResultQuestionMetric({
            text: 'Q1',
            averagePrecision: 0.8,
            unanswered: 1,
            averageResponseTime: 500,
          }),
          createMockZeroToOneHundredGameResultQuestionMetric({
            text: 'Q2',
            averagePrecision: 0.5,
            unanswered: 3,
            averageResponseTime: 700,
          }),
        ],
        completed,
      })

      const updated = aggregateQuizGameplaySummary(
        existing,
        gameResult,
        GameMode.ZeroToOneHundred,
        now,
      )

      expect(updated).toEqual({
        ...existing,
        count: 1,
        totalPlayerCount: 3,
        totalClassicCorrectCount: 0,
        totalClassicIncorrectCount: 0,
        totalClassicUnansweredCount: 0,
        totalZeroToOneHundredPrecisionSum: 1.6,
        totalZeroToOneHundredAnsweredCount: 2,
        totalZeroToOneHundredUnansweredCount: 4,
        lastPlayedAt: completed,
        updated: now,
      })
    })

    it('does not let unanswered-only questions skew ZeroToOneHundred precision', () => {
      const now = new Date('2026-01-26T10:00:00.000Z')
      const completed = new Date('2026-01-26T09:00:00.000Z')

      const existing = createMockQuizGameplaySummary({
        count: 4,
        totalPlayerCount: 12,
        totalZeroToOneHundredPrecisionSum: 2.0,
        totalZeroToOneHundredAnsweredCount: 6,
        totalZeroToOneHundredUnansweredCount: 1,
        lastPlayedAt: new Date('2026-01-24T09:00:00.000Z'),
        updated: new Date('2026-01-24T09:00:00.000Z'),
      })

      const gameResult = createMockGameResultDocument({
        players: [
          createMockGameResultPlayerMetric({
            participantId: 'p1',
            nickname: 'A',
            rank: 1,
            comebackRankGain: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 1000,
            longestCorrectStreak: 0,
            score: 10,
          }),
          createMockGameResultPlayerMetric({
            participantId: 'p2',
            nickname: 'B',
            rank: 2,
            comebackRankGain: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 1000,
            longestCorrectStreak: 0,
            score: 8,
          }),
          createMockGameResultPlayerMetric({
            participantId: 'p3',
            nickname: 'C',
            rank: 3,
            comebackRankGain: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 1000,
            longestCorrectStreak: 0,
            score: 6,
          }),
        ],
        questions: [
          createMockZeroToOneHundredGameResultQuestionMetric({
            text: 'Q1',
            averagePrecision: 0.99,
            unanswered: 3,
            averageResponseTime: 500,
          }),
        ],
        completed,
      })

      const updated = aggregateQuizGameplaySummary(
        existing,
        gameResult,
        GameMode.ZeroToOneHundred,
        now,
      )

      expect(updated.totalZeroToOneHundredAnsweredCount).toBe(6)
      expect(updated.totalZeroToOneHundredPrecisionSum).toBe(2.0)
      expect(updated.totalZeroToOneHundredUnansweredCount).toBe(4)
      expect(updated.count).toBe(5)
      expect(updated.totalPlayerCount).toBe(15)
      expect(updated.lastPlayedAt).toEqual(completed)
      expect(updated.updated).toEqual(now)
    })

    it('keeps lastPlayedAt as the latest date between existing and completed', () => {
      const now = new Date('2026-01-26T10:00:00.000Z')
      const existingLastPlayedAt = new Date('2026-01-26T12:00:00.000Z')
      const completed = new Date('2026-01-26T09:00:00.000Z')

      const existing = createMockQuizGameplaySummary({
        lastPlayedAt: existingLastPlayedAt,
        updated: new Date('2026-01-25T12:00:00.000Z'),
      })

      const gameResult = createMockGameResultDocument({
        players: [
          createMockGameResultPlayerMetric({
            participantId: 'p1',
            nickname: 'A',
            rank: 1,
            comebackRankGain: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 1000,
            longestCorrectStreak: 0,
            score: 10,
          }),
        ],
        questions: [
          createMockClassicGameResultQuestionMetric({
            text: 'Q1',
            type: QuestionType.TrueFalse,
            correct: 1,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 500,
          }),
        ],
        completed,
      })

      const updated = aggregateQuizGameplaySummary(
        existing,
        gameResult,
        GameMode.Classic,
        now,
      )

      expect(updated.lastPlayedAt).toEqual(existingLastPlayedAt)
      expect(updated.updated).toEqual(now)
    })

    it('does not add precision when averagePrecision is undefined, but still counts attempts and unanswered', () => {
      const now = new Date('2026-01-26T10:00:00.000Z')
      const completed = new Date('2026-01-26T09:00:00.000Z')

      const existing = createMockQuizGameplaySummary({
        totalZeroToOneHundredPrecisionSum: 5,
        totalZeroToOneHundredAnsweredCount: 10,
        totalZeroToOneHundredUnansweredCount: 20,
        updated: new Date('2026-01-25T12:00:00.000Z'),
      })

      const gameResult = createMockGameResultDocument({
        players: [
          createMockGameResultPlayerMetric({
            participantId: 'p1',
            nickname: 'A',
            rank: 1,
            comebackRankGain: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 1000,
            longestCorrectStreak: 0,
            score: 10,
          }),
          createMockGameResultPlayerMetric({
            participantId: 'p2',
            nickname: 'B',
            rank: 2,
            comebackRankGain: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 1000,
            longestCorrectStreak: 0,
            score: 8,
          }),
          createMockGameResultPlayerMetric({
            participantId: 'p3',
            nickname: 'C',
            rank: 3,
            comebackRankGain: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 1000,
            longestCorrectStreak: 0,
            score: 6,
          }),
        ],
        questions: [
          createMockZeroToOneHundredGameResultQuestionMetric({
            text: 'Q1',
            unanswered: 1,
            averageResponseTime: 500,
          }),
          createMockZeroToOneHundredGameResultQuestionMetric({
            text: 'Q2',
            unanswered: 0,
            averageResponseTime: 700,
          }),
        ],
        completed,
      })

      const updated = aggregateQuizGameplaySummary(
        existing,
        gameResult,
        GameMode.ZeroToOneHundred,
        now,
      )

      expect(updated.totalZeroToOneHundredPrecisionSum).toBe(5)
      expect(updated.totalZeroToOneHundredAnsweredCount).toBe(
        10 + (3 - 1) + (3 - 0),
      )
      expect(updated.totalZeroToOneHundredUnansweredCount).toBe(20 + 1 + 0)
      expect(updated.updated).toEqual(now)
      expect(updated.lastPlayedAt).toEqual(completed)
    })

    it('does not add precision when attempted count is zero, even if averagePrecision exists', () => {
      const now = new Date('2026-01-26T10:00:00.000Z')
      const completed = new Date('2026-01-26T09:00:00.000Z')

      const existing = createMockQuizGameplaySummary({
        totalZeroToOneHundredPrecisionSum: 2.5,
        totalZeroToOneHundredAnsweredCount: 7,
        totalZeroToOneHundredUnansweredCount: 0,
        updated: new Date('2026-01-25T12:00:00.000Z'),
      })

      const gameResult = createMockGameResultDocument({
        players: [
          createMockGameResultPlayerMetric({
            participantId: 'p1',
            nickname: 'A',
            rank: 1,
            comebackRankGain: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 1000,
            longestCorrectStreak: 0,
            score: 10,
          }),
          createMockGameResultPlayerMetric({
            participantId: 'p2',
            nickname: 'B',
            rank: 2,
            comebackRankGain: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 1000,
            longestCorrectStreak: 0,
            score: 8,
          }),
        ],
        questions: [
          createMockZeroToOneHundredGameResultQuestionMetric({
            text: 'Q1',
            averagePrecision: 1,
            unanswered: 2,
            averageResponseTime: 500,
          }),
        ],
        completed,
      })

      const updated = aggregateQuizGameplaySummary(
        existing,
        gameResult,
        GameMode.ZeroToOneHundred,
        now,
      )

      expect(updated.totalZeroToOneHundredPrecisionSum).toBe(2.5)
      expect(updated.totalZeroToOneHundredAnsweredCount).toBe(7)
      expect(updated.totalZeroToOneHundredUnansweredCount).toBe(2)
      expect(updated.updated).toEqual(now)
      expect(updated.lastPlayedAt).toEqual(completed)
    })

    it('falls back to base aggregation for unknown mode values', () => {
      const now = new Date('2026-01-26T10:00:00.000Z')
      const completed = new Date('2026-01-26T09:00:00.000Z')

      const existing = createMockQuizGameplaySummary({
        count: 1,
        totalPlayerCount: 5,
        lastPlayedAt: new Date('2026-01-25T12:00:00.000Z'),
        updated: new Date('2026-01-25T12:00:00.000Z'),
      })

      const gameResult = createMockGameResultDocument({
        players: [
          createMockGameResultPlayerMetric({
            participantId: 'p1',
            nickname: 'A',
            rank: 1,
            comebackRankGain: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 1000,
            longestCorrectStreak: 0,
            score: 10,
          }),
          createMockGameResultPlayerMetric({
            participantId: 'p2',
            nickname: 'B',
            rank: 2,
            comebackRankGain: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 1000,
            longestCorrectStreak: 0,
            score: 8,
          }),
        ],
        questions: [
          createMockClassicGameResultQuestionMetric({
            text: 'Q1',
            type: QuestionType.TrueFalse,
            correct: 2,
            incorrect: 0,
            unanswered: 0,
            averageResponseTime: 500,
          }),
        ],
        completed,
      })

      const updated = aggregateQuizGameplaySummary(
        existing,
        gameResult,
        'UnknownMode' as unknown as GameMode,
        now,
      )

      expect(updated.count).toBe(2)
      expect(updated.totalPlayerCount).toBe(7)
      expect(updated.lastPlayedAt).toEqual(completed)
      expect(updated.updated).toEqual(now)

      expect(updated.totalClassicCorrectCount).toBe(
        existing.totalClassicCorrectCount,
      )
      expect(updated.totalClassicIncorrectCount).toBe(
        existing.totalClassicIncorrectCount,
      )
      expect(updated.totalClassicUnansweredCount).toBe(
        existing.totalClassicUnansweredCount,
      )
      expect(updated.totalZeroToOneHundredPrecisionSum).toBe(
        existing.totalZeroToOneHundredPrecisionSum,
      )
      expect(updated.totalZeroToOneHundredAnsweredCount).toBe(
        existing.totalZeroToOneHundredAnsweredCount,
      )
      expect(updated.totalZeroToOneHundredUnansweredCount).toBe(
        existing.totalZeroToOneHundredUnansweredCount,
      )
    })
  })
})
