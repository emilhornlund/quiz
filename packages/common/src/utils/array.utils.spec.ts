import { afterEach, describe, expect, it, vi } from 'vitest'

import { arraysEqual, shuffleArray, shuffleDifferent } from './array.utils'

describe('arraysEqual', () => {
  it('returns false if either array is undefined/null', () => {
    expect(arraysEqual(undefined, [])).toBe(false)
    expect(arraysEqual([], undefined)).toBe(false)
    expect(arraysEqual(undefined, undefined)).toBe(false)
    expect(arraysEqual(null as unknown as number[], [])).toBe(false)
    expect(arraysEqual([] as number[], null as unknown as number[])).toBe(false)
  })

  it('returns false for different lengths', () => {
    expect(arraysEqual([1, 2], [1])).toBe(false)
  })

  it('returns true for strictly equal elements in same order', () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(arraysEqual(['a', 'b'], ['a', 'b'])).toBe(true)
    expect(arraysEqual([0, -0], [0, -0])).toBe(true) // 0 === -0
  })

  it('returns false when any element differs by value or type', () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 4])).toBe(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(arraysEqual([1, 2, '3' as any], [1, 2, 3])).toBe(false)
  })

  it('uses strict equality (different object refs are not equal)', () => {
    const a = [{ x: 1 }]
    const b = [{ x: 1 }]
    expect(arraysEqual(a, b)).toBe(false) // different references
    expect(arraysEqual(a, a)).toBe(true) // same reference
  })

  it('NaN is not strictly equal to NaN (returns false)', () => {
    expect(arraysEqual([NaN], [NaN])).toBe(false)
  })

  it('current behavior: sparse arrays can be treated as equal', () => {
    // NOTE: Because a.every(...) skips holes, this returns true with the current implementation.
    const a = new Array<number>(2)
    a[0] = 1 // [1, <hole>]
    const b = [1, 42]
    expect(arraysEqual(a, b)).toBe(true) // current behavior (quirk)
  })
})

describe('shuffleArray', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the same reference for empty or single-element arrays', () => {
    const empty: number[] = []
    const single = [7]
    expect(shuffleArray(empty)).toBe(empty)
    expect(shuffleArray(single)).toBe(single)
  })

  it('returns a new array instance for length >= 2', () => {
    const input = [1, 2]
    const out = shuffleArray(input)
    expect(out).not.toBe(input)
    expect(out).toHaveLength(2)
  })

  it('does not mutate the original array', () => {
    const input = [1, 2, 3, 4]
    const copy = [...input]
    shuffleArray(input)
    expect(input).toEqual(copy)
  })

  it('preserves all elements (as a multiset)', () => {
    const input = [1, 2, 2, 3, 4]
    const out = shuffleArray(input)
    expect(out).toHaveLength(input.length)
    // sort to compare multisets
    expect([...out].sort()).toEqual([...input].sort())
  })

  it('produces a deterministic permutation when Math.random is mocked', () => {
    // Fisher–Yates details: for n=5, i runs 4,3,2,1 → 4 random calls.
    // We choose j values via Math.floor(random * (i + 1)).
    // Let’s drive a specific sequence:
    // i=4 → random=0.0 → j=0  (swap idx 4<->0)
    // i=3 → random=0.5 → j=2  (swap idx 3<->2)
    // i=2 → random ~0.99 → j=2 (swap idx 2<->2) no-op
    // i=1 → random ~0.99 → j=1 (swap idx 1<->1) no-op
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.0)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.99)

    const input = [0, 1, 2, 3, 4]
    const out = shuffleArray(input)
    // Step-by-step expected:
    // start: [0,1,2,3,4]
    // i=4, j=0 → [4,1,2,3,0]
    // i=3, j=2 → [4,1,3,2,0]
    // i=2, j=2 → [4,1,3,2,0]
    // i=1, j=1 → [4,1,3,2,0]
    expect(out).toEqual([4, 1, 3, 2, 0])
  })
})

describe('shuffleDifferent', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the same reference for empty or single-element arrays', () => {
    const empty: number[] = []
    const single = [42]
    expect(shuffleDifferent(empty)).toBe(empty)
    expect(shuffleDifferent(single)).toBe(single)
  })

  it('does not mutate the original array', () => {
    const input = [1, 2, 3, 4]
    const copy = [...input]
    shuffleDifferent(input)
    expect(input).toEqual(copy)
  })

  it('preserves all elements (as a multiset)', () => {
    const input = [1, 2, 3, 4]
    const out = shuffleDifferent(input)
    expect(out).toHaveLength(input.length)
    expect([...out].sort()).toEqual([...input].sort())
  })

  it('returns a different order than the input (with deterministic retries)', () => {
    // For n=4, each shuffle consumes 3 random numbers (i=3,2,1).
    // We’ll force the first shuffle to be identity (j=i each time), then the second shuffle to perform a swap.
    //
    // To get j=i:
    //  - pick random in [i/(i+1), 1) so that floor(random*(i+1)) = i
    //
    // First shuffle (identity): i=3,2,1 → use 0.99, 0.99, 0.99
    // Second shuffle (introduce change): i=3 → random=0.0 → j=0 (guaranteed different), then anything for i=2,1.
    vi.spyOn(Math, 'random')
      // first shuffle (identity):
      .mockReturnValueOnce(0.99) // i=3, j=3
      .mockReturnValueOnce(0.99) // i=2, j=2
      .mockReturnValueOnce(0.99) // i=1, j=1
      // second shuffle (different):
      .mockReturnValueOnce(0.0) // i=3, j=0 (swap)
      .mockReturnValueOnce(0.99) // i=2, j=2
      .mockReturnValueOnce(0.99) // i=1, j=1

    const input = [10, 20, 30, 40]
    const out = shuffleDifferent(input)

    // Second shuffle step-by-step (starting from original, since shuffleArray copies):
    // start: [10,20,30,40]
    // i=3, j=0 → [40,20,30,10]
    // i=2, j=2 → [40,20,30,10]
    // i=1, j=1 → [40,20,30,10]
    expect(out).toEqual([40, 20, 30, 10])
    expect(out).not.toEqual(input)
  })

  it('eventually differs even if the first few shuffles match the original', () => {
    // For a 3-element array, each shuffle consumes 2 random calls (i=2,1).
    // Force two identity shuffles, then a different one.
    vi.spyOn(Math, 'random')
      // 1st shuffle (identity): i=2→j=2, i=1→j=1
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.99)
      // 2nd shuffle (identity): i=2→j=2, i=1→j=1
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.99)
      // 3rd shuffle (different): i=2→j=0 (swap), i=1→any
      .mockReturnValueOnce(0.0)
      .mockReturnValueOnce(0.5)

    const input = [1, 2, 3]
    const out = shuffleDifferent(input)
    expect(out).toEqual([3, 2, 1]) // from the 3rd shuffle’s first swap
    expect(out).not.toEqual(input)
    expect([...out].sort()).toEqual([1, 2, 3])
  })
})
