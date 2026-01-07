import { QuestionRangeAnswerMargin, QuestionType } from '@klurigo/common'

import {
  ClassicAnswer,
  ClassicCorrect,
  ClassicMeta,
} from '../core/classic-base-scoring-strategy'

import { ClassicRangeScoringStrategy } from './classic-range-strategy'

describe('ClassicRangeScoringStrategy', () => {
  const strategy = new ClassicRangeScoringStrategy()

  const buildCorrect = (value: number): ClassicCorrect<QuestionType.Range> =>
    ({
      value,
    }) as unknown as ClassicCorrect<QuestionType.Range>

  const buildAnswer = (
    answer: number,
    created?: Date,
  ): ClassicAnswer<QuestionType.Range> =>
    ({
      answer,
      created,
    }) as unknown as ClassicAnswer<QuestionType.Range>

  const buildMeta = (
    margin: QuestionRangeAnswerMargin,
    min = 0,
    max = 100,
    step = 2,
  ): ClassicMeta<QuestionType.Range> =>
    ({
      margin,
      min,
      max,
      step,
    }) as ClassicMeta<QuestionType.Range>

  describe('isCorrect', () => {
    it('returns true only for exact match when margin is None', () => {
      const correct = buildCorrect(100)
      const meta = buildMeta(QuestionRangeAnswerMargin.None)

      const exact = buildAnswer(100)
      const offByOne = buildAnswer(101)

      expect(strategy.isCorrect(correct, exact, meta)).toBe(true)
      expect(strategy.isCorrect(correct, offByOne, meta)).toBe(false)
    })

    it('validates range questions within Low margin', () => {
      const correct = buildCorrect(50)
      const meta = buildMeta(QuestionRangeAnswerMargin.Low)

      expect(strategy.isCorrect(correct, buildAnswer(44), meta)).toBe(true)
      expect(strategy.isCorrect(correct, buildAnswer(56), meta)).toBe(true)

      expect(strategy.isCorrect(correct, buildAnswer(43), meta)).toBe(false)
      expect(strategy.isCorrect(correct, buildAnswer(57), meta)).toBe(false)
    })

    it('validates range questions within Medium margin', () => {
      const correct = buildCorrect(50)
      const meta = buildMeta(QuestionRangeAnswerMargin.Medium)

      expect(strategy.isCorrect(correct, buildAnswer(40), meta)).toBe(true)
      expect(strategy.isCorrect(correct, buildAnswer(60), meta)).toBe(true)

      expect(strategy.isCorrect(correct, buildAnswer(39), meta)).toBe(false)
      expect(strategy.isCorrect(correct, buildAnswer(61), meta)).toBe(false)
    })

    it('validates range questions within High margin', () => {
      const correct = buildCorrect(50)
      const meta = buildMeta(QuestionRangeAnswerMargin.High)

      expect(strategy.isCorrect(correct, buildAnswer(30), meta)).toBe(true)
      expect(strategy.isCorrect(correct, buildAnswer(70), meta)).toBe(true)

      expect(strategy.isCorrect(correct, buildAnswer(29), meta)).toBe(false)
      expect(strategy.isCorrect(correct, buildAnswer(71), meta)).toBe(false)
    })

    it('validates range questions within Maximum margin', () => {
      const correct = buildCorrect(100)
      const meta = buildMeta(QuestionRangeAnswerMargin.Maximum)

      expect(strategy.isCorrect(correct, buildAnswer(0), meta)).toBe(true)
      expect(strategy.isCorrect(correct, buildAnswer(100), meta)).toBe(true)
    })

    it('returns false when answer is undefined', () => {
      const correct = buildCorrect(100)
      const meta = buildMeta(QuestionRangeAnswerMargin.None)

      expect(strategy.isCorrect(correct, undefined, meta)).toBe(false)
    })
  })

  describe('calculateScore', () => {
    it('calculates high score for fast and precise answers (Medium margin)', () => {
      const presented = new Date()
      const correctValue = 50
      const duration = 30
      const points = 1000

      const correct = buildCorrect(correctValue)
      const meta = buildMeta(QuestionRangeAnswerMargin.Medium, 0, 100, 2)
      const answerCreated = new Date(presented.getTime() + 5000) // 5 seconds
      const answer = buildAnswer(correctValue, answerCreated)

      const score = strategy.calculateScore(
        presented,
        answerCreated,
        duration,
        points,
        correct,
        answer,
        meta,
      )

      expect(score).toBe(983)
    })

    it('calculates reduced score for slower but precise answers', () => {
      const presented = new Date()
      const correctValue = 50
      const duration = 30
      const points = 1000

      const correct = buildCorrect(correctValue)
      const meta = buildMeta(QuestionRangeAnswerMargin.Medium, 0, 100, 2)
      const answerCreated = new Date(presented.getTime() + 25_000) // 25 seconds
      const answer = buildAnswer(correctValue, answerCreated)

      const score = strategy.calculateScore(
        presented,
        answerCreated,
        duration,
        points,
        correct,
        answer,
        meta,
      )

      expect(score).toBe(917)
    })

    it('calculates reduced score for fast but imprecise answers within margin', () => {
      const presented = new Date()
      const correctValue = 50
      const duration = 30
      const points = 1000

      const correct = buildCorrect(correctValue)
      const meta = buildMeta(QuestionRangeAnswerMargin.Medium, 0, 100, 2)
      const answerCreated = new Date(presented.getTime() + 5000) // 5 seconds
      const answer = buildAnswer(60, answerCreated) // within Medium margin

      const score = strategy.calculateScore(
        presented,
        answerCreated,
        duration,
        points,
        correct,
        answer,
        meta,
      )

      expect(score).toBe(383)
    })

    describe('precision curve behavior', () => {
      it('rewards closer answers more than farther answers within the margin (Medium margin)', () => {
        const presented = new Date()
        const correctValue = 50
        const duration = 30
        const points = 1000

        const correct = buildCorrect(correctValue)
        const meta = buildMeta(QuestionRangeAnswerMargin.Medium, 0, 100, 2)
        const answerCreated = new Date(presented.getTime() + 5000) // 5 seconds

        const scoreNear = strategy.calculateScore(
          presented,
          answerCreated,
          duration,
          points,
          correct,
          buildAnswer(52, answerCreated), // difference 2
          meta,
        )

        const scoreMid = strategy.calculateScore(
          presented,
          answerCreated,
          duration,
          points,
          correct,
          buildAnswer(55, answerCreated), // difference 5
          meta,
        )

        const scoreFar = strategy.calculateScore(
          presented,
          answerCreated,
          duration,
          points,
          correct,
          buildAnswer(59, answerCreated), // difference 9
          meta,
        )

        expect(scoreNear).toBe(813)
        expect(scoreMid).toBe(595)
        expect(scoreFar).toBe(402)

        expect(scoreNear).toBeGreaterThan(scoreMid)
        expect(scoreMid).toBeGreaterThan(scoreFar)
      })

      it('still awards the floor precision at the margin boundary (Medium margin)', () => {
        const presented = new Date()
        const correctValue = 50
        const duration = 30
        const points = 1000

        const correct = buildCorrect(correctValue)
        const meta = buildMeta(QuestionRangeAnswerMargin.Medium, 0, 100, 2)
        const answerCreated = new Date(presented.getTime() + 5000) // 5 seconds

        const score = strategy.calculateScore(
          presented,
          answerCreated,
          duration,
          points,
          correct,
          buildAnswer(60, answerCreated), // boundary => linearPrecision 0
          meta,
        )

        expect(score).toBe(383)
      })
    })

    it('returns 0 for answers outside the margin', () => {
      const presented = new Date()
      const correctValue = 50
      const duration = 30
      const points = 1000

      const correct = buildCorrect(correctValue)
      const meta = buildMeta(QuestionRangeAnswerMargin.Medium, 0, 100, 2)
      const answerCreated = new Date(presented.getTime() + 5000) // 5 seconds
      const answer = buildAnswer(61, answerCreated) // outside Medium margin

      const score = strategy.calculateScore(
        presented,
        answerCreated,
        duration,
        points,
        correct,
        answer,
        meta,
      )

      expect(score).toBe(0)
    })

    it('calculates score for Maximum margin regardless of precision (still time-based)', () => {
      const presented = new Date()
      const correctValue = 50
      const duration = 30
      const points = 1000

      const correct = buildCorrect(correctValue)
      const meta = buildMeta(QuestionRangeAnswerMargin.Maximum, 0, 100, 2)
      const answerCreated = new Date(presented.getTime() + 5000) // 5 seconds
      const answer = buildAnswer(100, answerCreated)

      const score = strategy.calculateScore(
        presented,
        answerCreated,
        duration,
        points,
        correct,
        answer,
        meta,
      )

      expect(score).toBe(383)
    })

    it('differentiates precision within Maximum margin (still uses precision curve)', () => {
      const presented = new Date()
      const correctValue = 50
      const duration = 30
      const points = 1000

      const correct = buildCorrect(correctValue)
      const meta = buildMeta(QuestionRangeAnswerMargin.Maximum, 0, 100, 2)
      const answerCreated = new Date(presented.getTime() + 5000) // 5 seconds

      const scorePerfect = strategy.calculateScore(
        presented,
        answerCreated,
        duration,
        points,
        correct,
        buildAnswer(50, answerCreated),
        meta,
      )

      const scoreMid = strategy.calculateScore(
        presented,
        answerCreated,
        duration,
        points,
        correct,
        buildAnswer(75, answerCreated), // difference 25
        meta,
      )

      const scoreEdge = strategy.calculateScore(
        presented,
        answerCreated,
        duration,
        points,
        correct,
        buildAnswer(100, answerCreated), // difference 50 => boundary for correct=50 when max=100
        meta,
      )

      expect(scorePerfect).toBe(983)
      expect(scoreMid).toBe(595)
      expect(scoreEdge).toBe(383)

      expect(scorePerfect).toBeGreaterThan(scoreMid)
      expect(scoreMid).toBeGreaterThan(scoreEdge)
    })

    it('handles exact matches for None margin (full precision bonus)', () => {
      const presented = new Date()
      const correctValue = 100
      const duration = 30
      const points = 1000

      const correct = buildCorrect(correctValue)
      const meta = buildMeta(QuestionRangeAnswerMargin.None, 0, 100, 2)
      const answerCreated = new Date(presented.getTime() + 5000) // 5 seconds
      const answer = buildAnswer(100, answerCreated)

      const score = strategy.calculateScore(
        presented,
        answerCreated,
        duration,
        points,
        correct,
        answer,
        meta,
      )

      expect(score).toBe(983)
    })

    it('handles answers at the exact duration limit', () => {
      const presented = new Date()
      const correctValue = 50
      const duration = 30
      const points = 1000

      const correct = buildCorrect(correctValue)
      const meta = buildMeta(QuestionRangeAnswerMargin.Medium, 0, 100, 2)
      const answerCreated = new Date(presented.getTime() + duration * 1000) // 30 seconds
      const answer = buildAnswer(50, answerCreated)

      const score = strategy.calculateScore(
        presented,
        answerCreated,
        duration,
        points,
        correct,
        answer,
        meta,
      )

      expect(score).toBe(900)
    })

    it('returns 0 when answered after duration even if within margin', () => {
      const presented = new Date()
      const correctValue = 50
      const duration = 30
      const points = 1000

      const correct = buildCorrect(correctValue)
      const meta = buildMeta(QuestionRangeAnswerMargin.Medium, 0, 100, 2)
      const afterDeadline = new Date(
        presented.getTime() + (duration + 1) * 1000,
      )

      const score = strategy.calculateScore(
        presented,
        afterDeadline,
        duration,
        points,
        correct,
        buildAnswer(correctValue, afterDeadline),
        meta,
      )

      expect(score).toBe(0)
    })

    it('returns 0 when answer is undefined', () => {
      const presented = new Date()
      const correct = buildCorrect(50)
      const meta = buildMeta(QuestionRangeAnswerMargin.Medium, 0, 100, 2)

      const score = strategy.calculateScore(
        presented,
        new Date(presented.getTime() + 5000),
        30,
        1000,
        correct,
        undefined,
        meta,
      )

      expect(score).toBe(0)
    })
  })
})
