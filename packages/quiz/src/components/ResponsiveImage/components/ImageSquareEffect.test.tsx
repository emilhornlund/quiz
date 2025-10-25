import { QuestionImageRevealEffectType } from '@quiz/common'
import { act } from '@testing-library/react'
import { cleanup, render } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ImageSquareEffect, ImageSquareEffectProps } from './ImageSquareEffect'

const defaultProps: ImageSquareEffectProps = {
  effect: QuestionImageRevealEffectType.Square3x3,
  countdown: undefined,
}

const tilesOf = (container: HTMLElement): HTMLElement[] => {
  const wrapper = container.firstElementChild as HTMLElement
  return wrapper ? (Array.from(wrapper.children) as HTMLElement[]) : []
}

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
    cleanup()
  })

  it('renders a square 3x3 correctly', () => {
    const { container } = render(
      <ImageSquareEffect
        {...defaultProps}
        effect={QuestionImageRevealEffectType.Square3x3}
      />,
    )
    expect(container).toMatchSnapshot()
  })

  it('renders a square 5x5 correctly', () => {
    const { container } = render(
      <ImageSquareEffect
        {...defaultProps}
        effect={QuestionImageRevealEffectType.Square5x5}
      />,
    )
    expect(container).toMatchSnapshot()
  })

  it('renders a square 8x8 correctly', () => {
    const { container } = render(
      <ImageSquareEffect
        {...defaultProps}
        effect={QuestionImageRevealEffectType.Square8x8}
      />,
    )
    expect(container).toMatchSnapshot()
  })

  it('renders with countdown', () => {
    const countdown = {
      serverTime: '2025-10-12T12:00:00.000Z',
      initiatedTime: '2025-10-12T11:59:59.000Z',
      expiryTime: '2025-10-12T12:00:01.000Z',
    }
    const { container } = render(
      <ImageSquareEffect {...defaultProps} countdown={countdown} />,
    )
    expect(container).toMatchSnapshot()
  })

  it('renders all tiles covered when no countdown is provided', () => {
    const { container } = render(<ImageSquareEffect {...defaultProps} />)
    const tiles = tilesOf(container)
    // 3x3 -> 9 tiles
    expect(tiles.length).toBe(9)
    tiles.forEach((tile) => {
      expect(tile.style.background).toBe('white')
    })
  })

  it('computes correct tile dimensions for 8x8', () => {
    const { container } = render(
      <ImageSquareEffect
        {...defaultProps}
        effect={QuestionImageRevealEffectType.Square8x8}
      />,
    )
    const tiles = tilesOf(container)
    expect(tiles.length).toBe(64)
    expect(tiles[0].style.width).toBe('100%')
    expect(tiles[0].style.height).toBe('100%')
  })

  it('reveals tiles deterministically (same seed => same pattern at 50% progress)', () => {
    // duration = 2000ms (11:59:59 -> 12:00:01). 50% happens exactly at serverTime (12:00:00).
    const countdown = makeCountdown(
      '2025-10-12T12:00:00.000Z',
      '2025-10-12T11:59:59.000Z',
      '2025-10-12T12:00:01.000Z',
    )

    // Make clientToServerOffset=0 and place time at 50%
    vi.setSystemTime(new Date('2025-10-12T12:00:00.000Z'))

    const r1 = render(
      <ImageSquareEffect {...defaultProps} countdown={countdown} />,
    )
    const r2 = render(
      <ImageSquareEffect {...defaultProps} countdown={countdown} />,
    )

    // Let the immediate tick run
    act(() => {
      vi.advanceTimersByTime(0)
    })

    const tiles1 = tilesOf(r1.container)
    const tiles2 = tilesOf(r2.container)

    expect(tiles1.length).toBe(9)
    expect(tiles2.length).toBe(9)

    for (let i = 0; i < tiles1.length; i++) {
      expect(tiles1[i].style.background).toBe(tiles2[i].style.background)
    }
  })

  it('uses different random orders when initiatedTime (seed) differs', () => {
    // Same server/expiry, different initiated => different seed/order.
    // At serverTime: progress differs (elapsed/duration), so patterns should differ.
    const countdownA = makeCountdown(
      '2025-10-12T12:00:00.000Z',
      '2025-10-12T11:59:59.000Z', // duration 2000ms, elapsed 1000ms => 50%
      '2025-10-12T12:00:01.000Z',
    )
    const countdownB = makeCountdown(
      '2025-10-12T12:00:00.000Z',
      '2025-10-12T11:59:58.000Z', // duration 3000ms, elapsed 2000ms => ~66.7%
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

    const tilesA = tilesOf(rA.container).map((t) => t.style.background)
    const tilesB = tilesOf(rB.container).map((t) => t.style.background)

    // Expect at least one tile to differ
    const allEqual = tilesA.every((bg, i) => bg === tilesB[i])
    expect(allEqual).toBe(false)
  })

  it('progresses from fully covered to fully revealed over time (5x5)', () => {
    const countdown = makeCountdown(
      '2025-10-12T12:00:00.000Z',
      '2025-10-12T11:59:59.000Z',
      '2025-10-12T12:00:01.000Z',
    )

    // Start at serverTime (mid-progress)
    vi.setSystemTime(new Date('2025-10-12T12:00:00.000Z'))

    const { container } = render(
      <ImageSquareEffect
        {...defaultProps}
        effect={QuestionImageRevealEffectType.Square5x5}
        countdown={countdown}
      />,
    )

    act(() => {
      vi.advanceTimersByTime(0) // immediate tick
    })

    const startTiles = tilesOf(container)
    expect(startTiles.length).toBe(25)
    const coveredAtStart = startTiles.filter(
      (t) => t.style.background === 'white',
    ).length
    expect(coveredAtStart).toBeGreaterThan(0)

    // Jump to expiry and let one interval tick fire
    vi.setSystemTime(new Date('2025-10-12T12:00:01.000Z'))
    act(() => {
      vi.advanceTimersByTime(250) // >= 200ms interval
    })

    const endTiles = tilesOf(container)
    const remainingCovered = endTiles.filter(
      (t) => t.style.background === 'white',
    ).length
    expect(remainingCovered).toBe(0)
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
