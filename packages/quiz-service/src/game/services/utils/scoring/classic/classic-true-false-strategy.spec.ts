import { QuestionType } from '@quiz/common'

import {
  ClassicAnswer,
  ClassicCorrect,
  ClassicMeta,
} from '../core/classic-base-scoring-strategy'

import { ClassicTrueFalseScoringStrategy } from './classic-true-false-strategy'

describe('ClassicTrueFalseScoringStrategy', () => {
  const strategy = new ClassicTrueFalseScoringStrategy()

  const meta = {} as ClassicMeta<QuestionType.TrueFalse>

  const correctTrue = {
    value: true,
  } as unknown as ClassicCorrect<QuestionType.TrueFalse>

  const correctFalse = {
    value: false,
  } as unknown as ClassicCorrect<QuestionType.TrueFalse>

  const buildAnswer = (value: boolean): ClassicAnswer<QuestionType.TrueFalse> =>
    ({
      answer: value,
    }) as unknown as ClassicAnswer<QuestionType.TrueFalse>

  describe('isCorrect', () => {
    it('returns true when answer matches correct value (true)', () => {
      const answer = buildAnswer(true)

      const result = strategy.isCorrect(correctTrue, answer, meta)

      expect(result).toBe(true)
    })

    it('returns true when answer matches correct value (false)', () => {
      const answer = buildAnswer(false)

      const result = strategy.isCorrect(correctFalse, answer, meta)

      expect(result).toBe(true)
    })

    it('returns false when answer does not match correct value', () => {
      const answer = buildAnswer(false)

      const result = strategy.isCorrect(correctTrue, answer, meta)

      expect(result).toBe(false)
    })

    it('returns false when answer is undefined', () => {
      const result = strategy.isCorrect(correctTrue, undefined, meta)

      expect(result).toBe(false)
    })

    it('returns false when answer is null', () => {
      const result = strategy.isCorrect(
        correctTrue,
        null as unknown as ClassicAnswer<QuestionType.TrueFalse>,
        meta,
      )

      expect(result).toBe(false)
    })
  })

  describe('calculateScore', () => {
    it('returns 0 when answer is incorrect', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const answered = new Date(presented.getTime() + 5_000)
      const duration = 10
      const points = 1000
      const answer = buildAnswer(false) // correct is true

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correctTrue,
        answer,
        meta,
      )

      expect(score).toBe(0)
    })

    it('returns 0 when answer is undefined', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const answered = new Date(presented.getTime() + 5_000)
      const score = strategy.calculateScore(
        presented,
        answered,
        10,
        1000,
        correctTrue,
        undefined,
        meta,
      )

      expect(score).toBe(0)
    })

    it('returns full points when correct answer is submitted immediately', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const answered = new Date(presented.getTime())
      const duration = 10
      const points = 1000
      const answer = buildAnswer(true)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correctTrue,
        answer,
        meta,
      )

      expect(score).toBe(1000)
    })

    it('applies linear decay down to 50% at the deadline (middle of duration → 75%)', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const duration = 10
      const answered = new Date(presented.getTime() + (duration * 1000) / 2)
      const points = 1000
      const answer = buildAnswer(true)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correctTrue,
        answer,
        meta,
      )

      expect(score).toBe(750)
    })

    it('returns 50% of points when answered exactly at the deadline', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const duration = 10
      const answered = new Date(presented.getTime() + duration * 1000)
      const points = 1000
      const answer = buildAnswer(true)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correctTrue,
        answer,
        meta,
      )

      expect(score).toBe(500)
    })

    it('returns 0 when answered after the deadline even if correct', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const duration = 10
      const answered = new Date(presented.getTime() + duration * 1000 + 1_000)
      const points = 1000
      const answer = buildAnswer(true)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correctTrue,
        answer,
        meta,
      )

      expect(score).toBe(0)
    })

    it('returns 0 when duration is non-positive even if answer is correct', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const answered = new Date(presented.getTime())
      const duration = 0
      const points = 1000
      const answer = buildAnswer(true)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correctTrue,
        answer,
        meta,
      )

      expect(score).toBe(0)
    })
  })
})
