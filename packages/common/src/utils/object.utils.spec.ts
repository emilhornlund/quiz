import { deepEqual } from './object.utils'

describe('object.utils', () => {
  describe('deepEqual', () => {
    it('should return true for identical primitives', () => {
      expect(deepEqual(1, 1)).toBe(true)
      expect(deepEqual('test', 'test')).toBe(true)
      expect(deepEqual(true, true)).toBe(true)
      expect(deepEqual(null, null)).toBe(true)
      expect(deepEqual(undefined, undefined)).toBe(true)
    })

    it('should return false for different primitives', () => {
      expect(deepEqual(1, 2)).toBe(false)
      expect(deepEqual('test', 'other')).toBe(false)
      expect(deepEqual(true, false)).toBe(false)
      expect(deepEqual(null, undefined)).toBe(false)
    })

    it('should return true for identical objects', () => {
      const obj1 = { a: 1, b: 'test', c: true }
      const obj2 = { a: 1, b: 'test', c: true }
      expect(deepEqual(obj1, obj2)).toBe(true)
    })

    it('should return false for different objects', () => {
      const obj1 = { a: 1, b: 'test' }
      const obj2 = { a: 1, b: 'other' }
      expect(deepEqual(obj1, obj2)).toBe(false)
    })

    it('should return true for identical arrays', () => {
      const arr1 = [1, 'test', true]
      const arr2 = [1, 'test', true]
      expect(deepEqual(arr1, arr2)).toBe(true)
    })

    it('should return false for different arrays', () => {
      const arr1 = [1, 'test', true]
      const arr2 = [1, 'other', true]
      expect(deepEqual(arr1, arr2)).toBe(false)
    })

    it('should handle nested objects', () => {
      const obj1 = { a: { b: { c: 1 } } }
      const obj2 = { a: { b: { c: 1 } } }
      const obj3 = { a: { b: { c: 2 } } }

      expect(deepEqual(obj1, obj2)).toBe(true)
      expect(deepEqual(obj1, obj3)).toBe(false)
    })

    it('should handle nested arrays', () => {
      const arr1 = [
        [1, 2],
        [3, 4],
      ]
      const arr2 = [
        [1, 2],
        [3, 4],
      ]
      const arr3 = [
        [1, 2],
        [3, 5],
      ]

      expect(deepEqual(arr1, arr2)).toBe(true)
      expect(deepEqual(arr1, arr3)).toBe(false)
    })

    it('should handle mixed nested structures', () => {
      const obj1 = { a: [1, { b: 2 }], c: { d: [3, 4] } }
      const obj2 = { a: [1, { b: 2 }], c: { d: [3, 4] } }
      const obj3 = { a: [1, { b: 3 }], c: { d: [3, 4] } }

      expect(deepEqual(obj1, obj2)).toBe(true)
      expect(deepEqual(obj1, obj3)).toBe(false)
    })
  })
})
