import { QuestionType } from '@quiz/common'

import {
  ClassicAnswer,
  ClassicCorrect,
  ClassicMeta,
} from '../core/classic-base-scoring-strategy'

import { ClassicTypeAnswerScoringStrategy } from './classic-type-answer-strategy'

describe('ClassicTypeAnswerScoringStrategy', () => {
  const strategy = new ClassicTypeAnswerScoringStrategy()

  const meta = {} as ClassicMeta<QuestionType.TypeAnswer>

  const correct = {
    value: 'Stockholm',
  } as unknown as ClassicCorrect<QuestionType.TypeAnswer>

  const buildAnswer = (value: string): ClassicAnswer<QuestionType.TypeAnswer> =>
    ({
      answer: value,
    }) as unknown as ClassicAnswer<QuestionType.TypeAnswer>

  describe('isCorrect', () => {
    it('returns true when answer matches correct value exactly', () => {
      const answer = buildAnswer('Stockholm')

      const result = strategy.isCorrect(correct, answer, meta)

      expect(result).toBe(true)
    })

    it('returns true when answer matches correct value ignoring case and surrounding whitespace', () => {
      const answer = buildAnswer('  stockholm  ')

      const result = strategy.isCorrect(correct, answer, meta)

      expect(result).toBe(true)
    })

    it('returns false when answer text does not match correct value', () => {
      const answer = buildAnswer('Gothenburg')

      const result = strategy.isCorrect(correct, answer, meta)

      expect(result).toBe(false)
    })

    it('returns false when answer is undefined', () => {
      const result = strategy.isCorrect(correct, undefined, meta)

      expect(result).toBe(false)
    })

    it('returns false when answer is only whitespace after trimming', () => {
      const answer = buildAnswer('   ')

      const result = strategy.isCorrect(correct, answer, meta)

      expect(result).toBe(false)
    })

    it('returns false when correct value is missing even if answer matches', () => {
      const emptyCorrect = {
        value: '',
      } as unknown as ClassicCorrect<QuestionType.TypeAnswer>
      const answer = buildAnswer('Stockholm')

      const result = strategy.isCorrect(emptyCorrect, answer, meta)

      expect(result).toBe(false)
    })
  })

  describe('calculateScore', () => {
    it('returns 0 when answer is incorrect', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const answered = new Date(presented.getTime() + 5_000)
      const duration = 10
      const points = 1000
      const answer = buildAnswer('Gothenburg')

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

    it('returns 0 when answer is undefined', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const answered = new Date(presented.getTime() + 5_000)

      const score = strategy.calculateScore(
        presented,
        answered,
        10,
        1000,
        correct,
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
      const answer = buildAnswer('Stockholm')

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
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
      const answer = buildAnswer('Stockholm')

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
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
      const answer = buildAnswer('Stockholm')

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answer,
        meta,
      )

      expect(score).toBe(500)
    })

    it('returns 0 when answered after the deadline even if answer is correct', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const duration = 10
      const answered = new Date(presented.getTime() + duration * 1000 + 1_000)
      const points = 1000
      const answer = buildAnswer('Stockholm')

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

    it('returns 0 when duration is non-positive even if answer is correct', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const answered = new Date(presented.getTime())
      const duration = 0
      const points = 1000
      const answer = buildAnswer('Stockholm')

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
  })
})
