import { render, screen, within } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import PointBehindIndicator from './PointsBehindIndicator'

describe('PointBehindIndicator', () => {
  it('renders points and nickname with strong emphasis', () => {
    render(<PointBehindIndicator points={12} nickname="Alice" />)

    const container = screen.getByText(/points behind/i).closest('div')!
    expect(container).toBeInTheDocument()

    const strongs = within(container).getAllByRole('strong', { hidden: true })
    expect(strongs).toHaveLength(2)
    expect(strongs[0]).toHaveTextContent('12')
    expect(strongs[1]).toHaveTextContent('Alice')

    expect(container).toMatchSnapshot()
  })

  it('renders another set of props and matches snapshot', () => {
    const { container } = render(
      <PointBehindIndicator points={1} nickname="Bob the Builder" />,
    )

    expect(screen.getByText(/points behind/i)).toHaveTextContent(
      '1 points behind Bob the Builder',
    )

    expect(container).toMatchSnapshot()
  })
})
