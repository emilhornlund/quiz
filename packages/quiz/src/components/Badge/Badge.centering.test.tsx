import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import Badge from './Badge'

describe('Badge number centering', () => {
  test('applies number-1 class for single digit 1', () => {
    render(<Badge size="large">1</Badge>)
    const badge = screen.getByText('1').closest('div')
    expect(badge).toHaveClass('number-1')
  })

  test('applies number-7 class for single digit 7', () => {
    render(<Badge size="large">7</Badge>)
    const badge = screen.getByText('7').closest('div')
    expect(badge).toHaveClass('number-7')
  })

  test('applies multi-digit class for two digit numbers', () => {
    render(<Badge size="large">10</Badge>)
    const badge = screen.getByText('10').closest('div')
    expect(badge).toHaveClass('multiDigit')
  })

  test('applies multi-digit class for three digit numbers', () => {
    render(<Badge size="large">100</Badge>)
    const badge = screen.getByText('100').closest('div')
    expect(badge).toHaveClass('multiDigit')
  })

  test('does not apply number classes for non-numeric content', () => {
    render(<Badge size="large">A</Badge>)
    const badge = screen.getByText('A').closest('div')
    expect(badge).not.toHaveClass('number-1')
    expect(badge).not.toHaveClass('multiDigit')
  })

  test('applies number class for numeric children prop', () => {
    render(<Badge size="large">{5}</Badge>)
    const badge = screen.getByText('5').closest('div')
    expect(badge).toHaveClass('number-5')
  })
})
