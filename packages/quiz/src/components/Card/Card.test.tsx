import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import Card from './Card'

describe('Card', () => {
  it('should render a Card with default props', async () => {
    const { container } = render(<Card />)

    expect(container).toMatchSnapshot()
  })

  it('should render a Card with prop kind primary', async () => {
    const { container } = render(<Card kind="primary" />)

    expect(container).toMatchSnapshot()
  })

  it('should render a Card with prop kind call-to-action', async () => {
    const { container } = render(<Card kind="call-to-action" />)

    expect(container).toMatchSnapshot()
  })

  it('should render a Card with prop kind success', async () => {
    const { container } = render(<Card kind="success" />)

    expect(container).toMatchSnapshot()
  })

  it('should render a Card with prop size small', async () => {
    const { container } = render(<Card size="small" />)

    expect(container).toMatchSnapshot()
  })

  it('should render a Card with prop size medium', async () => {
    const { container } = render(<Card size="medium" />)

    expect(container).toMatchSnapshot()
  })

  it('should render a Card with prop size large', async () => {
    const { container } = render(<Card size="large" />)

    expect(container).toMatchSnapshot()
  })

  it('should render a Card with prop size full', async () => {
    const { container } = render(<Card size="full" />)

    expect(container).toMatchSnapshot()
  })

  it('should render a Card with prop center true', async () => {
    const { container } = render(<Card center />)

    expect(container).toMatchSnapshot()
  })

  it('should render a Card with prop center false', async () => {
    const { container } = render(<Card center={false} />)

    expect(container).toMatchSnapshot()
  })

  it('should render a Card with children', async () => {
    const { container } = render(<Card>some text</Card>)

    expect(container).toMatchSnapshot()
  })
})
