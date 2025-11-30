import {
  QUESTION_PIN_TOLERANCE_RADIUS,
  QuestionPinTolerance,
  QuestionType,
} from '@quiz/common'

import {
  ClassicAnswer,
  ClassicCorrect,
  ClassicMeta,
} from '../core/classic-base-scoring-strategy'

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

    it('returns 0 when distance exceeds radius even if isCorrect returns true (defensive guard)', () => {
      const duration = 30
      const points = 1000
      const presented = new Date('2024-01-01T12:00:00.000Z')
      const correct = buildCorrect(makePoint(0.5, 0.5))
      const meta = buildMeta(QuestionPinTolerance.Medium)
      const radius = QUESTION_PIN_TOLERANCE_RADIUS[QuestionPinTolerance.Medium]

      const answered = new Date(presented.getTime() + 5000)
      const outsideAnswer = buildAnswer(
        makePoint(0.5 + (radius + 0.01), 0.5),
        answered,
      )

      const isCorrectSpy = jest
        .spyOn(strategy, 'isCorrect')
        .mockReturnValue(true)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        outsideAnswer,
        meta,
      )

      expect(isCorrectSpy).toHaveBeenCalled()
      expect(score).toBe(0)
    })
  })

  describe('toPinPositionFromString', () => {
    const callToPinPosition = (value?: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (strategy as any).toPinPositionFromString(value)

    it('returns {0,0} when value is undefined or empty', () => {
      expect(callToPinPosition(undefined)).toEqual({ x: 0, y: 0 })
      expect(callToPinPosition('')).toEqual({ x: 0, y: 0 })
    })

    it('returns {0,0} for malformed or non "x,y" strings', () => {
      const invalidValues = [
        'invalid',
        '1',
        '1,2,3',
        '1;',
        '1;2',
        ',',
        '1,',
        ',1',
      ]

      for (const value of invalidValues) {
        expect(callToPinPosition(value)).toEqual({ x: 0, y: 0 })
      }
    })

    it('parses valid x,y decimal strings into numbers', () => {
      expect(callToPinPosition('0.50,0.75')).toEqual({ x: 0.5, y: 0.75 })
      expect(callToPinPosition('1,0')).toEqual({ x: 1, y: 0 })
      expect(callToPinPosition('0,1')).toEqual({ x: 0, y: 1 })
    })

    it('parses values with surrounding whitespace', () => {
      expect(callToPinPosition(' 0.50 , 0.75 ')).toEqual({ x: 0.5, y: 0.75 })
    })

    it('does not clamp values outside the 0..1 range', () => {
      const result = callToPinPosition('-0.25,1.5')
      expect(result).toEqual({ x: -0.25, y: 1.5 })
    })

    it('sets x or y to NaN when the numeric parts are not parseable', () => {
      const mixed1 = callToPinPosition('foo,0.5')
      const mixed2 = callToPinPosition('0.5,bar')

      expect(Number.isNaN(mixed1.x)).toBe(true)
      expect(mixed1.y).toBe(0.5)

      expect(mixed2.x).toBe(0.5)
      expect(Number.isNaN(mixed2.y)).toBe(true)
    })
  })

  describe('calculateDistanceNorm', () => {
    const callDistance = (
      a: { x: number; y: number },
      b: { x: number; y: number },
    ) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (strategy as any).calculateDistanceNorm(a, b)

    it('returns 0 when points are identical', () => {
      const p = { x: 0.5, y: 0.5 }
      expect(callDistance(p, p)).toBe(0)
    })

    it('computes axis-aligned distances correctly', () => {
      expect(callDistance({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(1)
      expect(callDistance({ x: 0, y: 0 }, { x: 0, y: 1 })).toBe(1)
    })

    it('computes Euclidean distance and rounds to 2 decimals', () => {
      const a = { x: 0, y: 0 }
      const b = { x: 1, y: 1 }

      // √2 ≈ 1.4142 → 1.41 after rounding
      expect(callDistance(a, b)).toBe(1.41)
    })

    it('is symmetric for swapped arguments', () => {
      const a = { x: 0.25, y: 0.75 }
      const b = { x: 0.9, y: 0.1 }

      const d1 = callDistance(a, b)
      const d2 = callDistance(b, a)

      expect(d1).toBe(d2)
    })

    it('rounds down to 2 decimals when the 3rd decimal is < 5', () => {
      const a = { x: 0, y: 0 }
      const b = { x: 0.3333, y: 0 }

      // distance ≈ 0.3333 → 0.33
      expect(callDistance(a, b)).toBe(0.33)
    })

    it('rounds up to 2 decimals when the 3rd decimal is ≥ 5', () => {
      const a = { x: 0, y: 0 }
      const b = { x: 0.005, y: 0 }

      // distance = 0.005 → 0.01 after rounding
      expect(callDistance(a, b)).toBe(0.01)
    })

    it('handles non-normalized coordinates correctly', () => {
      const a = { x: 0, y: 0 }
      const b = { x: 3, y: 4 }

      // classic 3-4-5 triangle → 5.00
      expect(callDistance(a, b)).toBe(5)
    })
  })
})
