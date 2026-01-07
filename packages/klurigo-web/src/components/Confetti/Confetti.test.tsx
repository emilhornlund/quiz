import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Confetti from './Confetti'

describe('Confetti', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('does not render when trigger is false', () => {
    render(<Confetti trigger={false} intensity="normal" />)
    expect(screen.queryByTestId('confetti')).not.toBeInTheDocument()
  })

  it('renders when trigger is true and exposes trigger/intensity attributes', () => {
    render(<Confetti trigger={true} intensity="major" />)

    const confetti = screen.getByTestId('confetti')
    expect(confetti).toBeInTheDocument()
    expect(confetti).toHaveAttribute('data-trigger', 'true')
    expect(confetti).toHaveAttribute('data-intensity', 'major')
  })

  it('renders the correct number of particles for each intensity', () => {
    const { rerender } = render(<Confetti trigger={true} intensity="normal" />)

    expect(screen.getByTestId('confetti').childElementCount).toBe(25)

    rerender(<Confetti trigger={true} intensity="major" />)
    expect(screen.getByTestId('confetti').childElementCount).toBe(45)

    rerender(<Confetti trigger={true} intensity="epic" />)
    expect(screen.getByTestId('confetti').childElementCount).toBe(70)
  })

  it('cleans up after 2800ms and calls onAnimationEnd once', () => {
    const onAnimationEnd = vi.fn()

    render(
      <Confetti
        trigger={true}
        intensity="normal"
        onAnimationEnd={onAnimationEnd}
      />,
    )

    expect(screen.getByTestId('confetti')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2800)
    })

    expect(screen.queryByTestId('confetti')).not.toBeInTheDocument()
    expect(onAnimationEnd).toHaveBeenCalledTimes(1)
  })

  it('does not call onAnimationEnd if unmounted before timeout', () => {
    const onAnimationEnd = vi.fn()

    const { unmount } = render(
      <Confetti
        trigger={true}
        intensity="normal"
        onAnimationEnd={onAnimationEnd}
      />,
    )

    unmount()

    act(() => {
      vi.advanceTimersByTime(2800)
      vi.runOnlyPendingTimers()
    })

    expect(onAnimationEnd).not.toHaveBeenCalled()
  })

  it('renders particles with CSS custom properties', () => {
    render(<Confetti trigger={true} intensity="normal" />)

    const confetti = screen.getByTestId('confetti')
    const firstParticle = confetti.children[0] as HTMLElement

    expect(firstParticle.style.getPropertyValue('--random-x')).toBeTruthy()
    expect(firstParticle.style.getPropertyValue('--random-delay')).toBeTruthy()
    expect(
      firstParticle.style.getPropertyValue('--random-duration'),
    ).toBeTruthy()
    expect(
      firstParticle.style.getPropertyValue('--particle-color'),
    ).toBeTruthy()
    expect(firstParticle.style.getPropertyValue('--particle-size')).toBeTruthy()
  })
})
