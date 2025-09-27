import { afterEach, describe, expect, it, vi } from 'vitest'

import { getMessage, MESSAGES } from './message.utils'

describe('getMessage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns first message when Math.random is 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(getMessage()).toBe(MESSAGES[0])
  })

  it('returns middle message when Math.random is 0.5', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    expect(getMessage()).toBe(MESSAGES[1])
  })

  it('returns last message when Math.random is close to 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999)
    expect(getMessage()).toBe(MESSAGES[2])
  })

  it('returns one of the predefined messages', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.12)
    expect(MESSAGES).toContain(getMessage())
  })
})
