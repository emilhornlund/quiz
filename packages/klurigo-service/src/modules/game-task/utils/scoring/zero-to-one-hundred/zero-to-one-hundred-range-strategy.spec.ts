import { QuestionType } from '@klurigo/common'

import {
  ZeroToOneHundredAnswer,
  ZeroToOneHundredCorrect,
  ZeroToOneHundredMeta,
} from '../core/zero-to-one-hundred-base-scoring-strategy'

import { ZeroToOneHundredRangeScoringStrategy } from './zero-to-one-hundred-range-strategy'

describe('ZeroToOneHundredRangeScoringStrategy', () => {
  const strategy = new ZeroToOneHundredRangeScoringStrategy()

  const buildCorrect = (
    value: number,
  ): ZeroToOneHundredCorrect<QuestionType.Range> =>
    ({ value }) as unknown as ZeroToOneHundredCorrect<QuestionType.Range>

  const buildAnswer = (
    answer?: number,
  ): ZeroToOneHundredAnswer<QuestionType.Range> | undefined =>
    answer === undefined
      ? undefined
      : ({ answer } as unknown as ZeroToOneHundredAnswer<QuestionType.Range>)

  const buildMeta = (): ZeroToOneHundredMeta<QuestionType.Range> =>
    ({}) as ZeroToOneHundredMeta<QuestionType.Range>

  const presented = new Date('2024-01-01T12:00:00.000Z')
  const answered = new Date('2024-01-01T12:00:01.000Z')
  const duration = 30
  const points = 100

  describe('isCorrect', () => {
    it('returns true for answer within [0, 100]', () => {
      const correct = buildCorrect(50)
      const answer = buildAnswer(50)

      const result = strategy.isCorrect(correct, answer, buildMeta())

      expect(result).toBe(true)
    })

    it('returns false when answer is undefined', () => {
      const correct = buildCorrect(50)

      const result = strategy.isCorrect(correct, undefined, buildMeta())

      expect(result).toBe(false)
    })

    it('returns false when answer is below 0', () => {
      const correct = buildCorrect(50)
      const answer = buildAnswer(-5)

      const result = strategy.isCorrect(correct, answer, buildMeta())

      expect(result).toBe(false)
    })

    it('returns false when answer is above 100', () => {
      const correct = buildCorrect(50)
      const answer = buildAnswer(150)

      const result = strategy.isCorrect(correct, answer, buildMeta())

      expect(result).toBe(false)
    })
  })

  describe('calculateScore', () => {
    it('returns -10 for exact match', () => {
      const correct = buildCorrect(50)
      const answer = buildAnswer(50)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answer,
        buildMeta(),
      )

      expect(score).toBe(-10)
    })

    it('returns absolute difference for incorrect answers within range (above correct)', () => {
      const correct = buildCorrect(50)
      const answer = buildAnswer(55)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answer,
        buildMeta(),
      )

      expect(score).toBe(5)
    })

    it('returns absolute difference for incorrect answers within range (below correct)', () => {
      const correct = buildCorrect(50)
      const answer = buildAnswer(45)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answer,
        buildMeta(),
      )

      expect(score).toBe(5)
    })

    it('handles extremes in range: 0 and 100', () => {
      const correct = buildCorrect(50)

      const answer0 = buildAnswer(0)
      const score0 = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answer0,
        buildMeta(),
      )
      expect(score0).toBe(50)

      const answer100 = buildAnswer(100)
      const score100 = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answer100,
        buildMeta(),
      )
      expect(score100).toBe(50)
    })

    it('returns 100 for out-of-range answers (below 0)', () => {
      const correct = buildCorrect(50)
      const answer = buildAnswer(-10)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answer,
        buildMeta(),
      )

      expect(score).toBe(100)
    })

    it('returns 100 for out-of-range answers (above 100)', () => {
      const correct = buildCorrect(50)
      const answer = buildAnswer(120)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answer,
        buildMeta(),
      )

      expect(score).toBe(100)
    })

    it('returns 100 when answer is undefined', () => {
      const correct = buildCorrect(50)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        undefined,
        buildMeta(),
      )

      expect(score).toBe(100)
    })

    it('is symmetric around the correct value within range', () => {
      const correct = buildCorrect(50)
      const answerAbove = buildAnswer(60)
      const answerBelow = buildAnswer(40)

      const scoreAbove = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answerAbove,
        buildMeta(),
      )
      const scoreBelow = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answerBelow,
        buildMeta(),
      )

      expect(scoreAbove).toBe(10)
      expect(scoreBelow).toBe(10)
    })

    it('penalty increases with distance from the correct value', () => {
      const correct = buildCorrect(50)
      const closer = buildAnswer(55)
      const farther = buildAnswer(70)

      const closerScore = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        closer,
        buildMeta(),
      )
      const fartherScore = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        farther,
        buildMeta(),
      )

      expect(closerScore).toBeLessThan(fartherScore)
      expect(closerScore).toBe(5)
      expect(fartherScore).toBe(20)
    })
  })
})
