import { DiscoverySectionKey } from '@klurigo/common'
import { describe, expect, it } from 'vitest'

import {
  DISCOVERY_SECTION_DESCRIPTIONS,
  DISCOVERY_SECTION_TITLES,
  isDiscoverySectionKey,
} from './discovery.utils'

describe('DISCOVERY_SECTION_TITLES', () => {
  it('has an entry for every DiscoverySectionKey', () => {
    for (const key of Object.values(DiscoverySectionKey)) {
      expect(DISCOVERY_SECTION_TITLES[key]).toBeDefined()
      expect(typeof DISCOVERY_SECTION_TITLES[key]).toBe('string')
    }
  })
})

describe('DISCOVERY_SECTION_DESCRIPTIONS', () => {
  it('has an entry for every DiscoverySectionKey', () => {
    for (const key of Object.values(DiscoverySectionKey)) {
      expect(DISCOVERY_SECTION_DESCRIPTIONS[key]).toBeDefined()
      expect(typeof DISCOVERY_SECTION_DESCRIPTIONS[key]).toBe('string')
    }
  })
})

describe('isDiscoverySectionKey', () => {
  it('returns true for a valid section key', () => {
    expect(isDiscoverySectionKey('TOP_RATED')).toBe(true)
    expect(isDiscoverySectionKey('FEATURED')).toBe(true)
    expect(isDiscoverySectionKey('TRENDING')).toBe(true)
  })

  it('returns false for an unknown key', () => {
    expect(isDiscoverySectionKey('NONEXISTENT')).toBe(false)
    expect(isDiscoverySectionKey('')).toBe(false)
  })
})
