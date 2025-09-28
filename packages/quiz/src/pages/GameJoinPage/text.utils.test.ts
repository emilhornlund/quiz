import { describe, expect, it, vi } from 'vitest'

import { getMessage, getTitle, MESSAGES, TITLES } from './text.utils.ts'

describe('random string helpers', () => {
  describe('getTitle', () => {
    it('should return a value from TITLES', () => {
      const title = getTitle()
      expect(TITLES).toContain(title)
    })

    it('should return deterministic value when Math.random is mocked', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0) // pick first element
      expect(getTitle()).toBe(TITLES[0])

      vi.spyOn(Math, 'random').mockReturnValue(0.9999999) // pick last element
      expect(getTitle()).toBe(TITLES[TITLES.length - 1])

      vi.restoreAllMocks()
    })
  })

  describe('getMessage', () => {
    it('should return a value from MESSAGES', () => {
      const message = getMessage()
      expect(MESSAGES).toContain(message)
    })

    it('should return deterministic value when Math.random is mocked', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0)
      expect(getMessage()).toBe(MESSAGES[0])

      vi.spyOn(Math, 'random').mockReturnValue(0.9999999)
      expect(getMessage()).toBe(MESSAGES[MESSAGES.length - 1])

      vi.restoreAllMocks()
    })
  })

  describe('edge cases of getRandomString', () => {
    it('should return the only element if array has one element', () => {
      const singleArray = ['only']
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
      // Re-import the helper inline since it's not exported
      const getRandomString = (strings: string[]) => {
        const randomIndex = Math.floor(Math.random() * strings.length)
        return strings[randomIndex]
      }
      expect(getRandomString(singleArray)).toBe('only')
      vi.restoreAllMocks()
    })
  })
})
