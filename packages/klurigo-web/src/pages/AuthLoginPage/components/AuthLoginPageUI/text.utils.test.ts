import { afterEach, describe, expect, it, vi } from 'vitest'

import { getMessage, getTitle, MESSAGES, TITLES } from './text.utils'

describe('getTitle', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns first title when Math.random is 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(getTitle()).toBe(TITLES[0])
  })

  it('returns middle title when Math.random is 0.5', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5) // floor(0.5 * 5) = 2
    expect(getTitle()).toBe(TITLES[2])
  })

  it('returns last title when Math.random is close to 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999) // last index
    expect(getTitle()).toBe(TITLES[TITLES.length - 1])
  })

  it('returns one of the predefined titles', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.12)
    expect(TITLES).toContain(getTitle())
  })
})

describe('getMessage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns first message when Math.random is 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(getMessage()).toBe(MESSAGES[0])
  })

  it('returns middle message when Math.random is 0.5', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5) // floor(0.5 * 9) = 4
    expect(getMessage()).toBe(MESSAGES[4])
  })

  it('returns last message when Math.random is close to 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999) // last index
    expect(getMessage()).toBe(MESSAGES[MESSAGES.length - 1])
  })

  it('returns one of the predefined messages', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.23)
    expect(MESSAGES).toContain(getMessage())
  })
})
