import { describe, expect, it } from 'vitest'

import { topLevelFieldFromPath } from './paths'

describe('topLevelFieldFromPath', () => {
  it('should extract top-level field for simple property', () => {
    expect(topLevelFieldFromPath('question')).toBe('question')
  })

  it('should extract top-level field for array element nested property', () => {
    expect(topLevelFieldFromPath('options[0].value')).toBe('options')
  })

  it('should extract top-level field for nested object property', () => {
    expect(topLevelFieldFromPath('media.url')).toBe('media')
  })

  it('should extract top-level field for array index path', () => {
    expect(topLevelFieldFromPath('options[12]')).toBe('options')
  })

  it('should keep $ as top-level field for root path', () => {
    expect(topLevelFieldFromPath('$')).toBe('$')
  })
})
