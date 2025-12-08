import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, test, vi } from 'vitest'

import Confetti from './Confetti'

describe('Confetti', () => {
  test('does not render when trigger is false', () => {
    render(<Confetti trigger={false} intensity="normal" />)
    expect(document.querySelector('.confettiContainer')).not.toBeInTheDocument()
  })

  test('renders particles when trigger is true', () => {
    render(<Confetti trigger={true} intensity="normal" />)
    const container = document.querySelector('.confettiContainer')
    expect(container).toBeInTheDocument()

    const particles = document.querySelectorAll('.confettiParticle')
    expect(particles).toHaveLength(25) // normal intensity
  })

  test('renders correct number of particles for each intensity', () => {
    const { rerender } = render(<Confetti trigger={true} intensity="normal" />)
    expect(document.querySelectorAll('.confettiParticle')).toHaveLength(25)

    rerender(<Confetti trigger={true} intensity="major" />)
    expect(document.querySelectorAll('.confettiParticle')).toHaveLength(45)

    rerender(<Confetti trigger={true} intensity="epic" />)
    expect(document.querySelectorAll('.confettiParticle')).toHaveLength(70)
  })

  test('calls onAnimationEnd after animation completes', async () => {
    const onAnimationEnd = vi.fn()
    render(
      <Confetti
        trigger={true}
        intensity="normal"
        onAnimationEnd={onAnimationEnd}
      />,
    )

    // Wait for animation timeout (2.8s)
    await new Promise((resolve) => setTimeout(resolve, 2850))
    expect(onAnimationEnd).toHaveBeenCalledTimes(1)
  })

  test('does not call onAnimationEnd when trigger is false', async () => {
    const onAnimationEnd = vi.fn()
    render(
      <Confetti
        trigger={false}
        intensity="normal"
        onAnimationEnd={onAnimationEnd}
      />,
    )

    // Wait for potential animation timeout
    await new Promise((resolve) => setTimeout(resolve, 2850))
    expect(onAnimationEnd).not.toHaveBeenCalled()
  })

  test('particles have random properties', () => {
    render(<Confetti trigger={true} intensity="normal" />)
    const particles = document.querySelectorAll('.confettiParticle')

    // Check that particles have different random properties
    const firstParticle = particles[0] as HTMLElement
    const secondParticle = particles[1] as HTMLElement

    expect(firstParticle.style.getPropertyValue('--random-x')).toBeTruthy()
    expect(firstParticle.style.getPropertyValue('--random-delay')).toBeTruthy()
    expect(
      firstParticle.style.getPropertyValue('--random-duration'),
    ).toBeTruthy()
    expect(firstParticle.style.getPropertyValue('--particle-size')).toBeTruthy()

    // Should have different random values
    expect(firstParticle.style.getPropertyValue('--random-x')).not.toBe(
      secondParticle.style.getPropertyValue('--random-x'),
    )
  })

  test('particles have different shapes', () => {
    render(<Confetti trigger={true} intensity="normal" />)

    // Check that we have different shapes (circle, square, diamond)
    const circles = document.querySelectorAll('.confettiParticle:nth-child(3n)')
    const squares = document.querySelectorAll(
      '.confettiParticle:nth-child(3n+1)',
    )
    const diamonds = document.querySelectorAll(
      '.confettiParticle:nth-child(3n+2)',
    )

    expect(circles.length).toBeGreaterThan(0)
    expect(squares.length).toBeGreaterThan(0)
    expect(diamonds.length).toBeGreaterThan(0)
  })

  test('cleanup works correctly', async () => {
    render(<Confetti trigger={true} intensity="normal" />)

    // Initially renders particles
    expect(document.querySelectorAll('.confettiParticle')).toHaveLength(25)

    // Wait for cleanup
    await new Promise((resolve) => setTimeout(resolve, 2850))

    // Should be cleaned up
    expect(document.querySelector('.confettiContainer')).not.toBeInTheDocument()
  })
})
