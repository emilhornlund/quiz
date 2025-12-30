import { afterEach, describe, expect, it, vi } from 'vitest'

import { getMessage, getTitle, MESSAGES, TITLES } from './text.utils.ts'

describe('AuthRegister helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getTitle', () => {
    it('returns first title when Math.random is 0', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0)
      expect(getTitle()).toBe(TITLES[0])
    })

    it('returns middle title when Math.random is 0.5', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
      // TITLES length is 10 -> floor(0.5 * 10) = 5
      expect(getTitle()).toBe(TITLES[5])
    })

    it('returns last title when Math.random is close to 1', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.999999)
      expect(getTitle()).toBe(TITLES[TITLES.length - 1])
    })

    it('returns one of the predefined titles', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.12)
      expect(TITLES).toContain(getTitle())
    })
  })

  describe('getMessage', () => {
    it('returns first message when Math.random is 0', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0)
      expect(getMessage()).toBe(MESSAGES[0])
    })

    it('returns middle message when Math.random is 0.5', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
      // MESSAGES length is 9 -> floor(0.5 * 9) = 4
      expect(getMessage()).toBe(MESSAGES[4])
    })

    it('returns last message when Math.random is close to 1', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.999999)
      expect(getMessage()).toBe(MESSAGES[MESSAGES.length - 1])
    })

    it('returns one of the predefined messages', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.23)
      expect(MESSAGES).toContain(getMessage())
    })
  })
})
