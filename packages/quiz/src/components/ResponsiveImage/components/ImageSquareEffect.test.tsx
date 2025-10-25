import { QuestionImageRevealEffectType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { ImageSquareEffect, ImageSquareEffectProps } from './ImageSquareEffect'

const defaultProps: ImageSquareEffectProps = {
  box: { w: 200, h: 100 },
  effect: QuestionImageRevealEffectType.Square3x3,
  countdown: undefined,
}

describe('ImageSquareEffect', () => {
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
})
