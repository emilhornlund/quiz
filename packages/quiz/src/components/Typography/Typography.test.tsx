import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import Typography from './Typography.tsx'

describe('Typography', () => {
  it('should render with default props', () => {
    const { container } = render(<Typography>Default text content</Typography>)

    expect(container).toMatchSnapshot()
  })

  it('should render with title variant', () => {
    const { container } = render(
      <Typography variant="title">Title text</Typography>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render with subtitle variant', () => {
    const { container } = render(
      <Typography variant="subtitle">Subtitle text</Typography>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render with text variant', () => {
    const { container } = render(
      <Typography variant="text">Regular text</Typography>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render with link variant', () => {
    const { container } = render(
      <Typography variant="link">Link text</Typography>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render with hero variant', () => {
    const { container } = render(
      <Typography variant="hero">Hero title</Typography>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render with different sizes', () => {
    const { container: smallContainer } = render(
      <Typography size="small">Small text</Typography>,
    )
    const { container: mediumContainer } = render(
      <Typography size="medium">Medium text</Typography>,
    )
    const { container: fullContainer } = render(
      <Typography size="full">Full text</Typography>,
    )

    expect(smallContainer).toMatchSnapshot()
    expect(mediumContainer).toMatchSnapshot()
    expect(fullContainer).toMatchSnapshot()
  })
})
