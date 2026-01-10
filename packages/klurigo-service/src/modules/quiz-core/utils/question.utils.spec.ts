import { calculateRangeStep } from '@klurigo/common'

describe('Question Utils', () => {
  describe('calculateRangeStep', () => {
    it('should calculate steps correctly for a large range', () => {
      expect(calculateRangeStep(0, 10000)).toEqual(200)
    })

    it('should calculate steps correctly for a medium range', () => {
      expect(calculateRangeStep(0, 500)).toEqual(10)
    })

    it('should calculate steps correctly for a small range around zero', () => {
      expect(calculateRangeStep(-50, 50)).toEqual(2)
    })

    it('should calculate steps correctly for a very small range', () => {
      expect(calculateRangeStep(0, 100)).toEqual(2)
    })

    it('should calculate steps correctly for negative ranges', () => {
      expect(calculateRangeStep(-100, 0)).toEqual(2)
      expect(calculateRangeStep(-500, -100)).toEqual(8)
    })

    it('should handle ranges with min and max close to each other', () => {
      expect(calculateRangeStep(10, 12)).toEqual(1) // Range is 2
      expect(calculateRangeStep(10, 15)).toEqual(1) // Range is 5
    })

    it('should return reasonable steps when range is zero', () => {
      expect(calculateRangeStep(100, 100)).toEqual(0) // No range
    })

    it('should adjust step based on targetSteps', () => {
      expect(calculateRangeStep(0, 10000, 100)).toEqual(100) // Finer granularity
      expect(calculateRangeStep(0, 10000, 10)).toEqual(1000) // Coarser granularity
    })
  })
})
