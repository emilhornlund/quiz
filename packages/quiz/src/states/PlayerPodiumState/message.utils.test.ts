import { afterEach, describe, expect, it, vi } from 'vitest'

import { getPodiumPositionMessage, POSITION_MESSAGES } from './message.utils.ts'

describe('getPodiumPositionMessage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a first-place message', () => {
    const r = vi.spyOn(Math, 'random')
    r.mockReturnValue(0)
    expect(getPodiumPositionMessage(1)).toBe(POSITION_MESSAGES[1][0])
    r.mockReturnValue(0.5)
    expect(getPodiumPositionMessage(1)).toBe(POSITION_MESSAGES[1][2])
    r.mockReturnValue(0.999999)
    expect(getPodiumPositionMessage(1)).toBe(POSITION_MESSAGES[1][3])
  })

  it('returns a second-place message', () => {
    const r = vi.spyOn(Math, 'random')
    r.mockReturnValue(0)
    expect(getPodiumPositionMessage(2)).toBe(POSITION_MESSAGES[2][0])
    r.mockReturnValue(0.5)
    expect(getPodiumPositionMessage(2)).toBe(POSITION_MESSAGES[2][2])
    r.mockReturnValue(0.999999)
    expect(getPodiumPositionMessage(2)).toBe(POSITION_MESSAGES[2][3])
  })

  it('returns a third-place message', () => {
    const r = vi.spyOn(Math, 'random')
    r.mockReturnValue(0)
    expect(getPodiumPositionMessage(3)).toBe(POSITION_MESSAGES[3][0])
    r.mockReturnValue(0.5)
    expect(getPodiumPositionMessage(3)).toBe(POSITION_MESSAGES[3][2])
    r.mockReturnValue(0.999999)
    expect(getPodiumPositionMessage(3)).toBe(POSITION_MESSAGES[3][3])
  })

  it('returns a top-10 message for positions 4..10', () => {
    const r = vi.spyOn(Math, 'random')
    r.mockReturnValue(0)
    expect(getPodiumPositionMessage(4)).toBe(POSITION_MESSAGES.defaultTop10[0])
    r.mockReturnValue(0.999999)
    expect(getPodiumPositionMessage(10)).toBe(POSITION_MESSAGES.defaultTop10[3])
  })

  it('returns a top-20 message for positions 11..20', () => {
    const r = vi.spyOn(Math, 'random')
    r.mockReturnValue(0)
    expect(getPodiumPositionMessage(11)).toBe(POSITION_MESSAGES.defaultTop20[0])
    r.mockReturnValue(0.999999)
    expect(getPodiumPositionMessage(20)).toBe(POSITION_MESSAGES.defaultTop20[3])
  })

  it('returns a below-20 message for positions > 20', () => {
    const r = vi.spyOn(Math, 'random')
    r.mockReturnValue(0)
    expect(getPodiumPositionMessage(21)).toBe(
      POSITION_MESSAGES.defaultBelow20[0],
    )
    r.mockReturnValue(0.999999)
    expect(getPodiumPositionMessage(99)).toBe(
      POSITION_MESSAGES.defaultBelow20[3],
    )
  })

  it('always returns one of the category messages', () => {
    expect(POSITION_MESSAGES[1]).toContain(getPodiumPositionMessage(1))
    expect(POSITION_MESSAGES[2]).toContain(getPodiumPositionMessage(2))
    expect(POSITION_MESSAGES[3]).toContain(getPodiumPositionMessage(3))
    expect(POSITION_MESSAGES.defaultTop10).toContain(
      getPodiumPositionMessage(7),
    )
    expect(POSITION_MESSAGES.defaultTop20).toContain(
      getPodiumPositionMessage(13),
    )
    expect(POSITION_MESSAGES.defaultBelow20).toContain(
      getPodiumPositionMessage(25),
    )
  })
})
