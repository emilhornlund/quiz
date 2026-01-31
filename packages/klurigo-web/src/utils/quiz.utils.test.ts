import { describe, expect, it } from 'vitest'

import { toDifficultyLabel } from './quiz.utils'

describe('quiz.utils', () => {
  describe('toDifficultyLabel', () => {
    it('returns undefined when difficultyPercentage is missing', () => {
      expect(toDifficultyLabel()).toBeUndefined()
    })

    it('returns undefined when difficultyPercentage is not a number', () => {
      expect(toDifficultyLabel(undefined)).toBeUndefined()
      expect(toDifficultyLabel(null as unknown as number)).toBeUndefined()
      expect(toDifficultyLabel('0.5' as unknown as number)).toBeUndefined()
      expect(toDifficultyLabel(Number.NaN)).toBeUndefined()
    })

    it('clamps values below 0 to 0 (Easy)', () => {
      expect(toDifficultyLabel(-1)).toBe('Easy')
      expect(toDifficultyLabel(-0.0001)).toBe('Easy')
    })

    it('clamps values above 1 to 1 (Extreme)', () => {
      expect(toDifficultyLabel(1.0001)).toBe('Extreme')
      expect(toDifficultyLabel(2)).toBe('Extreme')
      expect(toDifficultyLabel(Number.POSITIVE_INFINITY)).toBe('Extreme')
    })

    it('maps Easy correctly (0.00..0.24)', () => {
      expect(toDifficultyLabel(0)).toBe('Easy')
      expect(toDifficultyLabel(0.1)).toBe('Easy')
      expect(toDifficultyLabel(0.2499)).toBe('Easy')
    })

    it('maps Medium correctly (0.25..0.49)', () => {
      expect(toDifficultyLabel(0.25)).toBe('Medium')
      expect(toDifficultyLabel(0.3)).toBe('Medium')
      expect(toDifficultyLabel(0.4999)).toBe('Medium')
    })

    it('maps Hard correctly (0.50..0.74)', () => {
      expect(toDifficultyLabel(0.5)).toBe('Hard')
      expect(toDifficultyLabel(0.6)).toBe('Hard')
      expect(toDifficultyLabel(0.7499)).toBe('Hard')
    })

    it('maps Extreme correctly (0.75..1.00)', () => {
      expect(toDifficultyLabel(0.75)).toBe('Extreme')
      expect(toDifficultyLabel(0.9)).toBe('Extreme')
      expect(toDifficultyLabel(1)).toBe('Extreme')
    })
  })
})
