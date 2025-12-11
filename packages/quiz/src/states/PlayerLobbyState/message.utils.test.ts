import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getMessage,
  getNextMessage,
  getRandomMessageExcluding,
  MESSAGES,
} from './message.utils'

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
    expect(getMessage()).toBe(MESSAGES[5])
  })

  it('returns last message when Math.random is close to 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999)
    expect(getMessage()).toBe(MESSAGES[9])
  })

  it('returns one of the predefined messages', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.12)
    expect(MESSAGES).toContain(getMessage())
  })
})

describe('getNextMessage', () => {
  it('returns next message in sequence when current message is found', () => {
    expect(getNextMessage(MESSAGES[7])).toBe(MESSAGES[8])
    expect(getNextMessage(MESSAGES[8])).toBe(MESSAGES[9])
    expect(getNextMessage(MESSAGES[9])).toBe(MESSAGES[0]) // Wraps around
  })

  it('returns random message when current message is not found', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const result = getNextMessage('Unknown message')
    expect(MESSAGES).toContain(result)
    expect(result).toBe(MESSAGES[5]) // Based on mocked random value
  })
})

describe('getRandomMessageExcluding', () => {
  it('returns message that is not the excluded one', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = getRandomMessageExcluding(MESSAGES[0])
    expect(MESSAGES).toContain(result)
    expect(result).not.toBe(MESSAGES[0])
  })

  it('returns any message when excluded message is not found', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999)
    const result = getRandomMessageExcluding('Unknown message')
    expect(MESSAGES).toContain(result)
  })

  it('returns different messages when multiple calls are made', () => {
    const results = new Set()
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.999999)

    results.add(getRandomMessageExcluding(MESSAGES[0]))
    results.add(getRandomMessageExcluding(MESSAGES[0]))
    results.add(getRandomMessageExcluding(MESSAGES[0]))

    expect(results.size).toBeGreaterThan(1)
  })
})
