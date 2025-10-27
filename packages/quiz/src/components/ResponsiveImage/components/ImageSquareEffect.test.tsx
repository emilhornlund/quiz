import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { ImageSquareEffect } from './ImageSquareEffect'

const defaultProps = {
  box: { w: 200, h: 100 },
  numberOfSquares: 4,
  countdown: undefined,
}

describe('ImageSquareEffect', () => {
  it('renders correctly (snapshot)', () => {
    const { container } = render(<ImageSquareEffect {...defaultProps} />)
    expect(container).toMatchSnapshot()
  })

  it('renders with countdown (snapshot)', () => {
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
})
