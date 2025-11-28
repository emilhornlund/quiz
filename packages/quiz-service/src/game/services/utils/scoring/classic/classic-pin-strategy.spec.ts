import {
  QUESTION_PIN_TOLERANCE_RADIUS,
  QuestionPinTolerance,
  QuestionType,
} from '@quiz/common'

import {
  ClassicAnswer,
  ClassicCorrect,
  ClassicMeta,
} from '../core/classic-base-strategy'

import { ClassicPinScoringStrategy } from './classic-pin-strategy'

describe('ClassicPinScoringStrategy', () => {
  const strategy = new ClassicPinScoringStrategy()

  const makePoint = (x: number, y: number) => `${x.toFixed(2)},${y.toFixed(2)}`

  const buildCorrect = (value: string): ClassicCorrect<QuestionType.Pin> =>
    ({
      value,
    }) as unknown as ClassicCorrect<QuestionType.Pin>

  const buildAnswer = (
    answer: string,
    created?: Date,
  ): ClassicAnswer<QuestionType.Pin> =>
    ({
      answer,
      created,
    }) as unknown as ClassicAnswer<QuestionType.Pin>

  const buildMeta = (
    tolerance: QuestionPinTolerance,
  ): ClassicMeta<QuestionType.Pin> =>
    ({
      tolerance,
    }) as ClassicMeta<QuestionType.Pin>

  describe('isCorrect', () => {
    const correctValue = makePoint(0.5, 0.5)
    const correct = buildCorrect(correctValue)

    it('returns false when correct.value is missing', () => {
      const meta = buildMeta(QuestionPinTolerance.Low)
      const answer = buildAnswer(makePoint(0.5, 0.5))

      const result = strategy.isCorrect(
        { value: '' } as unknown as ClassicCorrect<QuestionType.Pin>,
        answer,
        meta,
      )

      expect(result).toBe(false)
    })

    it('returns false when answer is undefined', () => {
      const meta = buildMeta(QuestionPinTolerance.Low)

      const result = strategy.isCorrect(correct, undefined, meta)

      expect(result).toBe(false)
    })

    it('validates Low tolerance: inside, boundary, outside radius', () => {
      const tolerance = QuestionPinTolerance.Low
      const meta = buildMeta(tolerance)
      const radius = QUESTION_PIN_TOLERANCE_RADIUS[tolerance]

      const inside = buildAnswer(makePoint(0.5 + (radius - 0.01), 0.5))
      const atBoundary = buildAnswer(
        makePoint(0.5 + Number(radius.toFixed(2)), 0.5),
      )
      const outside = buildAnswer(makePoint(0.5 + (radius + 0.01), 0.5))

      expect(strategy.isCorrect(correct, inside, meta)).toBe(true)
      expect(strategy.isCorrect(correct, atBoundary, meta)).toBe(true)
      expect(strategy.isCorrect(correct, outside, meta)).toBe(false)
    })

    it('validates Medium tolerance: inside, boundary, outside radius', () => {
      const tolerance = QuestionPinTolerance.Medium
      const meta = buildMeta(tolerance)
      const radius = QUESTION_PIN_TOLERANCE_RADIUS[tolerance]

      const inside = buildAnswer(makePoint(0.5 + (radius - 0.01), 0.5))
      const atBoundary = buildAnswer(
        makePoint(0.5 + Number(radius.toFixed(2)), 0.5),
      )
      const outside = buildAnswer(makePoint(0.5 + (radius + 0.01), 0.5))

      expect(strategy.isCorrect(correct, inside, meta)).toBe(true)
      expect(strategy.isCorrect(correct, atBoundary, meta)).toBe(true)
      expect(strategy.isCorrect(correct, outside, meta)).toBe(false)
    })

    it('validates High tolerance: inside, boundary, outside radius', () => {
      const tolerance = QuestionPinTolerance.High
      const meta = buildMeta(tolerance)
      const radius = QUESTION_PIN_TOLERANCE_RADIUS[tolerance]

      const inside = buildAnswer(makePoint(0.5 + (radius - 0.01), 0.5))
      const atBoundary = buildAnswer(
        makePoint(0.5 + Number(radius.toFixed(2)), 0.5),
      )
      const outside = buildAnswer(makePoint(0.5 + (radius + 0.01), 0.5))

      expect(strategy.isCorrect(correct, inside, meta)).toBe(true)
      expect(strategy.isCorrect(correct, atBoundary, meta)).toBe(true)
      expect(strategy.isCorrect(correct, outside, meta)).toBe(false)
    })

    it('Maximum tolerance: far-away answers are still correct', () => {
      const tolerance = QuestionPinTolerance.Maximum
      const meta = buildMeta(tolerance)

      const exact = buildAnswer(makePoint(0.5, 0.5))
      const farCorner = buildAnswer(makePoint(0.95, 0.95))
      const oppositeCorner = buildAnswer(makePoint(0.0, 0.0))

      expect(strategy.isCorrect(correct, exact, meta)).toBe(true)
      expect(strategy.isCorrect(correct, farCorner, meta)).toBe(true)
      expect(strategy.isCorrect(correct, oppositeCorner, meta)).toBe(true)
    })
  })

  describe('calculateScore', () => {
    const duration = 30
    const points = 1000
    const presented = new Date('2024-01-01T12:00:00.000Z')
    const correct = buildCorrect(makePoint(0.5, 0.5))
    const meta = buildMeta(QuestionPinTolerance.Medium)
    const radius = QUESTION_PIN_TOLERANCE_RADIUS[QuestionPinTolerance.Medium]

    it('returns 0 when answer is outside tolerance radius', () => {
      const answered = new Date(presented.getTime() + 5000)
      const answer = buildAnswer(
        makePoint(0.5 + (radius + 0.01), 0.5),
        answered,
      )

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answer,
        meta,
      )

      expect(score).toBe(0)
    })

    it('exact location → highest score (within bounds)', () => {
      const answered = new Date(presented.getTime() + 5000)
      const exact = buildAnswer(makePoint(0.5, 0.5), answered)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        exact,
        meta,
      )

      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(points)
    })

    it('within tolerance (half radius) → lower than exact but higher than boundary', () => {
      const answered = new Date(presented.getTime() + 5000)
      const exact = buildAnswer(makePoint(0.5, 0.5), answered)
      const halfRadius = buildAnswer(makePoint(0.5 + radius / 2, 0.5), answered)
      const atBoundary = buildAnswer(
        makePoint(0.5 + Number(radius.toFixed(2)), 0.5),
        answered,
      )

      const exactScore = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        exact,
        meta,
      )
      const halfScore = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        halfRadius,
        meta,
      )
      const boundaryScore = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        atBoundary,
        meta,
      )

      expect(halfScore).toBeGreaterThan(boundaryScore)
      expect(exactScore).toBeGreaterThan(halfScore)
      expect(boundaryScore).toBeGreaterThan(0)
    })

    it('monotonicity: closer answer yields strictly higher score (same timing)', () => {
      const answered = new Date(presented.getTime() + 5000)

      const farther = buildAnswer(makePoint(0.5 + radius * 0.8, 0.5), answered)
      const closer = buildAnswer(makePoint(0.5 + radius * 0.4, 0.5), answered)

      const scoreFar = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        farther,
        meta,
      )
      const scoreClose = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        closer,
        meta,
      )

      expect(scoreClose).toBeGreaterThan(scoreFar)
    })

    it('timing matters: same position, slower answer → lower score', () => {
      const fastAnswered = new Date(presented.getTime() + 2000)
      const slowAnswered = new Date(presented.getTime() + 15000)

      const fastAnswer = buildAnswer(makePoint(0.55, 0.5), fastAnswered)
      const slowAnswer = buildAnswer(makePoint(0.55, 0.5), slowAnswered)

      const fastScore = strategy.calculateScore(
        presented,
        fastAnswered,
        duration,
        points,
        correct,
        fastAnswer,
        meta,
      )
      const slowScore = strategy.calculateScore(
        presented,
        slowAnswered,
        duration,
        points,
        correct,
        slowAnswer,
        meta,
      )

      expect(fastScore).toBeGreaterThan(slowScore)
    })

    it('returns 0 when answer is undefined', () => {
      const answered = new Date(presented.getTime() + 5000)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        undefined,
        meta,
      )

      expect(score).toBe(0)
    })
  })
})
