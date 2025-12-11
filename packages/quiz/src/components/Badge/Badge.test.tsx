import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, test, vi } from 'vitest'

import Badge from './Badge'

describe('Badge', () => {
  test('renders with default props', () => {
    render(<Badge>Test</Badge>)
    const badge = screen.getByText('Test')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('small')
  })

  test('renders with custom size and background color', () => {
    render(
      <Badge size="large" backgroundColor="green">
        <FontAwesomeIcon icon={faCheck} />
      </Badge>,
    )
    const badge = screen.getByRole('img', { hidden: true })
    expect(badge).toBeInTheDocument()
    expect(badge.closest('div')).toHaveClass('large')
  })

  test('applies celebration animation classes', () => {
    render(
      <Badge celebration="normal" backgroundColor="green">
        <FontAwesomeIcon icon={faCheck} />
      </Badge>,
    )
    const badge = screen.getByRole('img', { hidden: true })
    expect(badge.closest('div')).toHaveClass('celebrationNormal')
  })

  test('applies major celebration animation', () => {
    render(
      <Badge celebration="major" backgroundColor="green">
        <FontAwesomeIcon icon={faCheck} />
      </Badge>,
    )
    const badge = screen.getByRole('img', { hidden: true })
    expect(badge.closest('div')).toHaveClass('celebrationMajor')
  })

  test('applies epic celebration animation', () => {
    render(
      <Badge celebration="epic" backgroundColor="green">
        <FontAwesomeIcon icon={faCheck} />
      </Badge>,
    )
    const badge = screen.getByRole('img', { hidden: true })
    expect(badge.closest('div')).toHaveClass('celebrationEpic')
  })

  test('does not apply animation when celebration is none', () => {
    render(
      <Badge celebration="none" backgroundColor="green">
        <FontAwesomeIcon icon={faCheck} />
      </Badge>,
    )
    const badge = screen.getByRole('img', { hidden: true })
    const badgeElement = badge.closest('div')
    expect(badgeElement).not.toHaveClass('celebrationNormal')
    expect(badgeElement).not.toHaveClass('celebrationMajor')
    expect(badgeElement).not.toHaveClass('celebrationEpic')
  })

  test('calls onAnimationEnd after animation completes', async () => {
    const onAnimationEnd = vi.fn()
    render(
      <Badge celebration="normal" onAnimationEnd={onAnimationEnd}>
        <FontAwesomeIcon icon={faCheck} />
      </Badge>,
    )

    // Wait for animation timeout (800ms + small buffer)
    await new Promise((resolve) => setTimeout(resolve, 850))
    expect(onAnimationEnd).toHaveBeenCalledTimes(1)
  })

  test('does not call onAnimationEnd when celebration is none', async () => {
    const onAnimationEnd = vi.fn()
    render(
      <Badge celebration="none" onAnimationEnd={onAnimationEnd}>
        <FontAwesomeIcon icon={faCheck} />
      </Badge>,
    )

    // Wait for potential animation timeout
    await new Promise((resolve) => setTimeout(resolve, 850))
    expect(onAnimationEnd).not.toHaveBeenCalled()
  })
})
