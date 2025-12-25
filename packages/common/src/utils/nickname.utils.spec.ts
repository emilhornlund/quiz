import { afterEach, describe, expect, it, vi } from 'vitest'

import { generateNickname } from './nickname.utils' // <-- adjust path

// Local copies for assertions (kept in sync with the source)
const ADJECTIVES = [
  'Frosty',
  'Fiery',
  'Electric',
  'Shadow',
  'Mystic',
  'Thunder',
  'Icy',
  'Swift',
  'Crimson',
  'Golden',
  'Stormy',
  'Lunar',
  'Solar',
  'Phantom',
  'Radiant',
  'Infernal',
  'Celestial',
  'Vivid',
  'Rogue',
  'Twisted',
  'Majestic',
  'Cosmic',
  'Glacial',
  'Wild',
  'Brave',
  'Turbo',
  'Velvet',
  'Atomic',
  'Echo',
  'Daring',
] as const

const ANIMALS = [
  'Bear',
  'Wolf',
  'Fox',
  'Falcon',
  'Dragon',
  'Tiger',
  'Panther',
  'Phoenix',
  'Eagle',
  'Serpent',
  'Raven',
  'Shark',
  'Lynx',
  'Cheetah',
  'Cobra',
  'Bison',
  'Jackal',
  'Owl',
  'Leopard',
  'Puma',
  'Viper',
  'Stallion',
  'Kraken',
  'Hawk',
  'Tundra',
  'Raptor',
  'Basilisk',
  'Griffin',
  'Scorpion',
  'Yeti',
] as const

describe('generateNickname', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls Math.random exactly twice per nickname generation', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5)
    generateNickname()
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('uses lower-bound selection when Math.random() returns 0 (first items)', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0)
    const nick = generateNickname()
    expect(nick).toBe(`${ADJECTIVES[0]}${ANIMALS[0]}`) // FrostyBear
  })

  it('uses upper-bound selection when Math.random() is just below 1 (last items)', () => {
    // floor(0.999999 * len) === len - 1
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.999999)
      .mockReturnValueOnce(0.999999)

    const nick = generateNickname()
    expect(nick).toBe(
      `${ADJECTIVES[ADJECTIVES.length - 1]}${ANIMALS[ANIMALS.length - 1]}`,
    ) // DaringYeti
  })

  it('picks adjective and animal independently (different random values)', () => {
    // adjective index 1 -> 'Fiery', animal index 3 -> 'Falcon'
    const adjIdx = 1
    const aniIdx = 3

    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(adjIdx / ADJECTIVES.length + 1e-9)
      .mockReturnValueOnce(aniIdx / ANIMALS.length + 1e-9)

    const nick = generateNickname()
    expect(nick).toBe(`${ADJECTIVES[adjIdx]}${ANIMALS[aniIdx]}`)
  })

  it('returns a non-empty string with only letters (no spaces or punctuation)', () => {
    const nick = generateNickname()
    expect(typeof nick).toBe('string')
    expect(nick.length).toBeGreaterThan(0)
    // current lists contain only A–Z letters; ensure no spaces/punct
    expect(/^[A-Za-z]+$/.test(nick)).toBe(true)
  })

  it('always composes a valid "<Adjective><Animal>" from the defined sets', () => {
    for (let i = 0; i < 100; i++) {
      const nick = generateNickname()

      // adjectives that are prefixes of nick
      const matchingAdjectives = ADJECTIVES.filter((a) => nick.startsWith(a))
      expect(matchingAdjectives.length).toBeGreaterThan(0)

      // exactly one split where the suffix is a valid animal
      const validSplits = matchingAdjectives.filter((a) => {
        const suffix = nick.slice(a.length)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return ANIMALS.indexOf(suffix as any) !== -1
      })
      expect(validSplits.length).toBe(1)
    }
  })

  it('produces different outputs for different random sequences (deterministic via mocking)', () => {
    // First run: pick indices 0 and 0
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.0).mockReturnValueOnce(0.0)
    const n1 = generateNickname()
    expect(n1).toBe(`${ADJECTIVES[0]}${ANIMALS[0]}`)

    vi.restoreAllMocks()

    // Second run: pick different indices
    const adjIdx = ADJECTIVES.length - 2 // 'Echo'
    const aniIdx = ANIMALS.length - 2 // 'Scorpion'
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(adjIdx / ADJECTIVES.length + 1e-9)
      .mockReturnValueOnce(aniIdx / ANIMALS.length + 1e-9)

    const n2 = generateNickname()
    expect(n2).toBe(`${ADJECTIVES[adjIdx]}${ANIMALS[aniIdx]}`)

    expect(n1).not.toBe(n2)
  })

  it('never throws and always returns members of the Cartesian product of defined sets (smoke)', () => {
    for (let i = 0; i < 200; i++) {
      const nick = generateNickname()
      const maybeAdj = ADJECTIVES.find((a) => nick.startsWith(a))
      expect(maybeAdj).toBeDefined()
      const rest = nick.slice(maybeAdj!.length)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(ANIMALS.indexOf(rest as any) !== -1).toBe(true)
    }
  })
})
