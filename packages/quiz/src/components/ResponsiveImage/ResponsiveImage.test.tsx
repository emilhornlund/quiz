import { QuestionImageRevealEffectType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import ResponsiveImage from './ResponsiveImage'

describe('ResponsiveImage', () => {
  it('should render ResponsiveImage with props', async () => {
    const { container } = render(
      <ResponsiveImage
        imageURL="https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg"
        alt="Who painted The Starry Night?"
      />,
    )
    expect(container).toMatchSnapshot()
  })

  it('should render loading state', () => {
    const { container } = render(<ResponsiveImage alt="loading" />)
    expect(container).toMatchSnapshot()
  })

  it('should render error state', () => {
    const { container } = render(
      <ResponsiveImage imageURL="invalid-url" alt="error" />,
    )
    expect(container).toMatchSnapshot()
  })

  it('should render with blur effect', () => {
    const { container } = render(
      <ResponsiveImage
        imageURL="https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg"
        alt="blur"
        revealEffect={{ type: QuestionImageRevealEffectType.Blur }}
      />,
    )
    expect(container).toMatchSnapshot()
  })

  it('should render with square effect', () => {
    const { container } = render(
      <ResponsiveImage
        imageURL="https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg"
        alt="square"
        revealEffect={{ type: QuestionImageRevealEffectType.Square3x3 }}
      />,
    )
    expect(container).toMatchSnapshot()
  })

  it('should render with overlay children', () => {
    const { container } = render(
      <ResponsiveImage
        imageURL="https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg"
        alt="overlay">
        <span>Overlay Content</span>
      </ResponsiveImage>,
    )
    expect(container).toMatchSnapshot()
  })

  it('should render with noBorder', () => {
    const { container } = render(
      <ResponsiveImage
        imageURL="https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg"
        alt="noBorder"
        noBorder
      />,
    )
    expect(container).toMatchSnapshot()
  })
})
