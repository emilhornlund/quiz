import { describe, expect, it } from 'vitest'

import { QuestionRangeAnswerMargin } from '../models'

import {
  calculateRangeBounds,
  calculateRangeStep,
  ceilToStep,
  clamp,
  ensureAtLeastOneStep,
  floorToStep,
  snapToStep,
  snapToStepInside,
} from './range.utils'

describe('range.helper', () => {
  describe('clamp', () => {
    it('returns x when within [a,b]', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })

    it('clamps below', () => {
      expect(clamp(-1, 0, 10)).toBe(0)
    })

    it('clamps above', () => {
      expect(clamp(11, 0, 10)).toBe(10)
    })
  })

  describe('floorToStep', () => {
    it('floors to previous grid line from min', () => {
      // grid: 0, 4, 8, 12...
      expect(floorToStep(7, 0, 4)).toBe(4)
      expect(floorToStep(8, 0, 4)).toBe(8)
      // non-zero min → grid: 3, 8, 13...
      expect(floorToStep(12, 3, 5)).toBe(8)
    })

    it('handles negative/offset min correctly', () => {
      // grid: -5, -1, 3, 7, ...
      expect(floorToStep(-3, -5, 4)).toBe(-5)
      expect(floorToStep(2.9, -5, 4)).toBe(-1)
    })
  })

  describe('ceilToStep', () => {
    it('ceils to next grid line from min', () => {
      // grid: 0, 4, 8, 12...
      expect(ceilToStep(7, 0, 4)).toBe(8)
      expect(ceilToStep(8, 0, 4)).toBe(8)
      // non-zero min → grid: 3, 8, 13...
      expect(ceilToStep(12, 3, 5)).toBe(13)
    })

    it('handles negative/offset min correctly', () => {
      // grid: -5, -1, 3, 7, ...
      expect(ceilToStep(-3, -5, 4)).toBe(-1)
      expect(ceilToStep(2.9, -5, 4)).toBe(3)
    })
  })

  describe('snapToStep', () => {
    it('rounds to nearest grid from min; ties round up (Math.round)', () => {
      // grid: 0, 10, 20...
      expect(snapToStep(4, 0, 10)).toBe(0) // nearer 0
      expect(snapToStep(6, 0, 10)).toBe(10) // nearer 10
      expect(snapToStep(5, 0, 10)).toBe(10) // tie → up
      // non-zero min → grid: 3, 8, 13...
      expect(snapToStep(10, 3, 5)).toBe(8)
      expect(snapToStep(11, 3, 5)).toBe(13)
    })
  })

  describe('snapToStepInside', () => {
    it('picks nearest in-range grid point, preferring lower on ties', () => {
      // grid: 0, 10, 20; range [0, 100]
      expect(snapToStepInside(4, 0, 100, 10)).toBe(0) // nearer 0
      expect(snapToStepInside(6, 0, 100, 10)).toBe(10) // nearer 10
      expect(snapToStepInside(15, 0, 100, 10)).toBe(10) // tie → lower
    })

    it('avoids snapping outside when max is not on grid', () => {
      // grid: 0, 4, 8, 12; range [0,10] → inside: 0,4,8
      expect(snapToStepInside(10, 0, 10, 4)).toBe(8)
    })

    it('when step > range and min is on the grid, returns min (not clamp)', () => {
      // grid: 0, 4, 8...; inside [0,3] only 0 is on-grid
      expect(snapToStepInside(2, 0, 3, 4)).toBe(0)
      expect(snapToStepInside(-1, 0, 3, 4)).toBe(0)
      expect(snapToStepInside(10, 0, 3, 4)).toBe(0) // up=4 out of range → 0
    })

    it('when min is the only in-range grid (min between lines), returns min, not clamp', () => {
      // grid anchored at min: 1, 11, 21 ... ; in [1,9] only 1 is available
      expect(snapToStepInside(2, 1, 9, 10)).toBe(1)
      expect(snapToStepInside(-5, 1, 9, 10)).toBe(1)
      expect(snapToStepInside(15, 1, 9, 10)).toBe(1)
    })

    it('chooses nearest endpoint grid when both neighbors are outside', () => {
      // grid inside [0,18] with step 10 → {0,10}
      expect(snapToStepInside(17, 0, 18, 10)).toBe(10) // closer to 10
    })

    it('ties between endpoint grids prefer the lower one', () => {
      // grid inside [0,20] with step 10 → {0,10,20}
      // x=5 is equidistant (5) to 0 and 10 → lower (0)
      expect(snapToStepInside(5, 0, 20, 10)).toBe(0)
    })
  })

  describe('ensureAtLeastOneStep', () => {
    it('returns unchanged when width >= step', () => {
      expect(ensureAtLeastOneStep({ lower: 10, upper: 12 }, 0, 100, 2)).toEqual(
        { lower: 10, upper: 12 },
      )
    })

    it('widens to the right when possible', () => {
      // width 1 < step 2, can push right within max
      expect(ensureAtLeastOneStep({ lower: 10, upper: 11 }, 0, 20, 2)).toEqual({
        lower: 10,
        upper: 13,
      })
    })

    it('otherwise widens to the left when possible', () => {
      expect(ensureAtLeastOneStep({ lower: 19, upper: 20 }, 0, 20, 2)).toEqual({
        lower: 17,
        upper: 20,
      })
    })

    it('falls back to full range if neither side can fit', () => {
      // step > range; cannot widen
      expect(ensureAtLeastOneStep({ lower: 0, upper: 0 }, 0, 1, 2)).toEqual({
        lower: 0,
        upper: 1,
      })
    })
  })

  describe('calculateRangeStep', () => {
    it('returns 0 when range <= 0', () => {
      expect(calculateRangeStep(0, 0)).toBe(0)
      expect(calculateRangeStep(10, 5)).toBe(0)
      expect(calculateRangeStep(5, 5)).toBe(0)
    })

    it('produces nice integer steps near range/targetSteps', () => {
      expect(calculateRangeStep(0, 10000, 50)).toBe(200)
      expect(calculateRangeStep(0, 500, 50)).toBe(10)
      expect(calculateRangeStep(-50, 50, 50)).toBe(2)
      expect(calculateRangeStep(0, 100, 50)).toBe(2)
    })

    it('never returns less than 1', () => {
      expect(calculateRangeStep(0, 10, 1000)).toBe(1)
    })
  })

  describe('calculateRangeBounds', () => {
    it('throws on invalid min/max', () => {
      expect(() =>
        calculateRangeBounds(
          QuestionRangeAnswerMargin.Low,
          50,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Number.NaN as any,
          100,
          2,
        ),
      ).toThrow(/Invalid min\/max/i)

      expect(() =>
        calculateRangeBounds(
          QuestionRangeAnswerMargin.Low,
          50,
          0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Number.NaN as any,
          2,
        ),
      ).toThrow(/Invalid min\/max/i)

      expect(() =>
        calculateRangeBounds(QuestionRangeAnswerMargin.Low, 50, 10, 0, 2),
      ).toThrow(/Invalid min\/max/i)
    })

    describe('Maximum', () => {
      it('returns full range', () => {
        expect(
          calculateRangeBounds(
            QuestionRangeAnswerMargin.Maximum,
            50,
            0,
            100,
            2,
          ),
        ).toEqual({ lower: 0, upper: 100 })
      })

      it('returns the whole range even if correct is outside', () => {
        expect(
          calculateRangeBounds(
            QuestionRangeAnswerMargin.Maximum,
            1_000,
            0,
            100,
            2,
          ),
        ).toEqual({ lower: 0, upper: 100 })
      })
    })

    describe('None (exact grid match inside range)', () => {
      it('collapses to nearest in-range grid point (basic)', () => {
        // grid: 0,2,4,...,100
        expect(
          calculateRangeBounds(QuestionRangeAnswerMargin.None, 50.9, 0, 100, 2),
        ).toEqual({ lower: 50, upper: 50 })

        expect(
          calculateRangeBounds(QuestionRangeAnswerMargin.None, 49.1, 0, 100, 2),
        ).toEqual({ lower: 50, upper: 50 })
      })

      it('tie-breaks to lower grid point', () => {
        // grid: 0,10,20; x=15 is equal distance → choose 10
        expect(
          calculateRangeBounds(QuestionRangeAnswerMargin.None, 15, 0, 100, 10),
        ).toEqual({ lower: 10, upper: 10 })
      })

      it('does not snap outside when max is off-grid', () => {
        // grid: 0,4,8,12; range [0,10] → inside {0,4,8}; x=10 → 8
        expect(
          calculateRangeBounds(QuestionRangeAnswerMargin.None, 10, 0, 10, 4),
        ).toEqual({ lower: 8, upper: 8 })
      })

      it('when step > range and min is the only in-range grid point, collapses to min', () => {
        expect(
          calculateRangeBounds(QuestionRangeAnswerMargin.None, 2, 0, 3, 4),
        ).toEqual({ lower: 0, upper: 0 })
      })

      it('handles zero range (min === max) by collapsing to that value', () => {
        expect(
          calculateRangeBounds(QuestionRangeAnswerMargin.None, 5, 5, 5, 1),
        ).toEqual({ lower: 5, upper: 5 })
      })
    })

    describe('Low / Medium / High (percent of full range, snap outward, clamp, ensure ≥ step)', () => {
      it('Low: symmetric outward snap on grid', () => {
        // range 0..100, halfWidth = 5 → raw [45,55] → step=2 outward → [44,56]
        expect(
          calculateRangeBounds(QuestionRangeAnswerMargin.Low, 50, 0, 100, 2),
        ).toEqual({ lower: 44, upper: 56 })
      })

      it('Low: near min clamps and still snaps outward', () => {
        // Low (5%): half=5 → raw [-2..8] → floor(-2)=-2 → clamp→0; ceil(8)=8
        expect(
          calculateRangeBounds(QuestionRangeAnswerMargin.Low, 3, 0, 100, 2),
        ).toEqual({ lower: 0, upper: 8 })
      })

      it('Low: near max clamps and still snaps outward', () => {
        // Low (5%): half=5 → raw [93..103] → floor(93)=92; ceil(103)=104 → clamp upper to 100
        expect(
          calculateRangeBounds(QuestionRangeAnswerMargin.Low, 98, 0, 100, 2),
        ).toEqual({ lower: 92, upper: 100 })
      })

      it('Low: uses s = (max - min) when step <= 0', () => {
        // range 0..100, Low=5% → raw [45,55]; with s=100 snap outward → [0,100]
        expect(
          calculateRangeBounds(QuestionRangeAnswerMargin.Low, 50, 0, 100, 0),
        ).toEqual({ lower: 0, upper: 100 })

        expect(
          calculateRangeBounds(QuestionRangeAnswerMargin.Low, 50, 0, 100, -5),
        ).toEqual({ lower: 0, upper: 100 })
      })

      it('Low: handles non-zero/negative min correctly', () => {
        // range -50..50, Low=5% → halfWidth=5 → raw [-5,5] → step=5 outward → [-5,5]
        expect(
          calculateRangeBounds(QuestionRangeAnswerMargin.Low, 0, -50, 50, 5),
        ).toEqual({ lower: -5, upper: 5 })
      })

      it('Medium: near left edge clamps and snaps outward', () => {
        // range 0..100, halfWidth = 10 → raw [-7,13] → floorToStep(-7)= -8 → clamp→0; ceilToStep(13)=16
        expect(
          calculateRangeBounds(QuestionRangeAnswerMargin.Medium, 3, 0, 100, 4),
        ).toEqual({ lower: 0, upper: 16 })
      })

      it('Medium: centered and snapped outward', () => {
        // half-width = 10 → raw [40..60] → already on grid [40..60]
        expect(
          calculateRangeBounds(QuestionRangeAnswerMargin.Medium, 50, 0, 100, 2),
        ).toEqual({ lower: 40, upper: 60 })
      })

      it('High: symmetric outward snap when far from edges', () => {
        // range 0..100, halfWidth = 20 → raw [30,70] → step=5 → [30,70]
        expect(
          calculateRangeBounds(QuestionRangeAnswerMargin.High, 50, 0, 100, 5),
        ).toEqual({ lower: 30, upper: 70 })
      })

      it('ensures at least one step when collapsed by edges/step', () => {
        // range 0..1, step 2 → any window < 2 → ensureAtLeastOneStep → [min,max]
        expect(
          calculateRangeBounds(QuestionRangeAnswerMargin.Low, 0.5, 0, 1, 2),
        ).toEqual({ lower: 0, upper: 1 })
      })

      it('Handles non-integer steps', () => {
        // Low (5%): half=5 → raw [45..55]; step=2.5 → outward snap stays [45..55]
        expect(
          calculateRangeBounds(QuestionRangeAnswerMargin.Low, 50, 0, 100, 2.5),
        ).toEqual({ lower: 45, upper: 55 })
      })
    })
  })
})
