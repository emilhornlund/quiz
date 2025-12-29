import { QuestionImageRevealEffectType } from '@klurigo/common'
import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ImageSquareEffect, {
  type ImageSquareEffectProps,
} from './ImageSquareEffect'

vi.mock('./ImageSquareEffect.module.scss', () => ({
  default: {
    imageSquareEffect: 'imageSquareEffect',
    tile: 'tile',
    revealed: 'revealed',
  },
}))

const defaultProps: ImageSquareEffectProps = {
  effect: QuestionImageRevealEffectType.Square3x3,
  countdown: undefined,
}

const tilesOf = (container: HTMLElement): HTMLElement[] => {
  const wrapper = container.firstElementChild as HTMLElement | null
  if (!wrapper) return []
  return Array.from(wrapper.children) as HTMLElement[]
}

const isRevealed = (el: HTMLElement) => el.className.includes('revealed')

const makeCountdown = (
  serverISO: string,
  initiatedISO: string,
  expiryISO: string,
) => ({
  serverTime: serverISO,
  initiatedTime: initiatedISO,
  expiryTime: expiryISO,
})

describe('ImageSquareEffect', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders a square 3x3 correctly', () => {
    const { container } = render(
      <ImageSquareEffect
        {...defaultProps}
        effect={QuestionImageRevealEffectType.Square3x3}
      />,
    )
    expect(tilesOf(container).length).toBe(9)
  })

  it('renders a square 5x5 correctly', () => {
    const { container } = render(
      <ImageSquareEffect
        {...defaultProps}
        effect={QuestionImageRevealEffectType.Square5x5}
      />,
    )
    expect(tilesOf(container).length).toBe(25)
  })

  it('renders a square 8x8 correctly', () => {
    const { container } = render(
      <ImageSquareEffect
        {...defaultProps}
        effect={QuestionImageRevealEffectType.Square8x8}
      />,
    )
    expect(tilesOf(container).length).toBe(64)
  })

  it('renders with countdown (structure smoke test)', () => {
    const countdown = {
      serverTime: '2025-10-12T12:00:00.000Z',
      initiatedTime: '2025-10-12T11:59:59.000Z',
      expiryTime: '2025-10-12T12:00:01.000Z',
    }
    const { container } = render(
      <ImageSquareEffect {...defaultProps} countdown={countdown} />,
    )
    expect(tilesOf(container).length).toBe(9)
  })

  it('renders all tiles covered when no countdown is provided', () => {
    const { container } = render(<ImageSquareEffect {...defaultProps} />)
    const tiles = tilesOf(container)
    expect(tiles.length).toBe(9)
    tiles.forEach((t) => expect(isRevealed(t)).toBe(false))
  })

  it('computes correct tile count for 8x8', () => {
    const { container } = render(
      <ImageSquareEffect
        {...defaultProps}
        effect={QuestionImageRevealEffectType.Square8x8}
      />,
    )
    const tiles = tilesOf(container)
    expect(tiles.length).toBe(64)
  })

  it('reveals tiles deterministically (same seed => same pattern at 50% progress)', () => {
    const countdown = makeCountdown(
      '2025-10-12T12:00:00.000Z',
      '2025-10-12T11:59:59.000Z',
      '2025-10-12T12:00:01.000Z',
    )

    vi.setSystemTime(new Date('2025-10-12T12:00:00.000Z'))

    const r1 = render(
      <ImageSquareEffect {...defaultProps} countdown={countdown} />,
    )
    const r2 = render(
      <ImageSquareEffect {...defaultProps} countdown={countdown} />,
    )

    act(() => {
      vi.advanceTimersByTime(0)
    })

    const tiles1 = tilesOf(r1.container)
    const tiles2 = tilesOf(r2.container)

    expect(tiles1.length).toBe(9)
    expect(tiles2.length).toBe(9)

    for (let i = 0; i < tiles1.length; i++) {
      expect(isRevealed(tiles1[i])).toBe(isRevealed(tiles2[i]))
    }
  })

  it('uses different random orders when initiatedTime (seed) differs', () => {
    const countdownA = makeCountdown(
      '2025-10-12T12:00:00.000Z',
      '2025-10-12T11:59:59.000Z',
      '2025-10-12T12:00:01.000Z',
    )
    const countdownB = makeCountdown(
      '2025-10-12T12:00:00.000Z',
      '2025-10-12T11:59:58.000Z',
      '2025-10-12T12:00:01.000Z',
    )

    vi.setSystemTime(new Date('2025-10-12T12:00:00.000Z'))

    const rA = render(
      <ImageSquareEffect {...defaultProps} countdown={countdownA} />,
    )
    const rB = render(
      <ImageSquareEffect {...defaultProps} countdown={countdownB} />,
    )

    act(() => {
      vi.advanceTimersByTime(0)
    })

    const flagsA = tilesOf(rA.container).map(isRevealed)
    const flagsB = tilesOf(rB.container).map(isRevealed)

    const allEqual = flagsA.every((v, i) => v === flagsB[i])
    expect(allEqual).toBe(false)
  })

  it('progresses from partially covered to fully revealed over time (5x5)', () => {
    const countdown = makeCountdown(
      '2025-10-12T12:00:00.000Z',
      '2025-10-12T11:59:59.000Z',
      '2025-10-12T12:00:01.000Z',
    )

    vi.setSystemTime(new Date('2025-10-12T12:00:00.000Z'))

    const { container } = render(
      <ImageSquareEffect
        {...defaultProps}
        effect={QuestionImageRevealEffectType.Square5x5}
        countdown={countdown}
      />,
    )

    act(() => {
      vi.advanceTimersByTime(0)
    })

    const startTiles = tilesOf(container)
    expect(startTiles.length).toBe(25)
    const revealedAtStart = startTiles.filter(isRevealed).length
    expect(revealedAtStart).toBeGreaterThan(0)

    vi.setSystemTime(new Date('2025-10-12T12:00:01.000Z'))
    act(() => {
      vi.advanceTimersByTime(250)
    })

    const endTiles = tilesOf(container)
    const notRevealedAtEnd = endTiles.filter((t) => !isRevealed(t)).length
    expect(notRevealedAtEnd).toBe(0)
  })

  it('cleans up its interval on unmount', () => {
    const countdown = makeCountdown(
      '2025-10-12T12:00:00.000Z',
      '2025-10-12T11:59:59.000Z',
      '2025-10-12T12:00:01.000Z',
    )
    const clearSpy = vi.spyOn(global, 'clearInterval')

    const { unmount } = render(
      <ImageSquareEffect {...defaultProps} countdown={countdown} />,
    )
    act(() => {
      vi.advanceTimersByTime(200)
    })
    unmount()
    expect(clearSpy).toHaveBeenCalled()
  })
})
