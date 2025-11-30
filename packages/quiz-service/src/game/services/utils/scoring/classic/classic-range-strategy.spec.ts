import { QuestionRangeAnswerMargin, QuestionType } from '@quiz/common'

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

      expect(score).toBe(183)
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

      expect(score).toBe(183)
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
