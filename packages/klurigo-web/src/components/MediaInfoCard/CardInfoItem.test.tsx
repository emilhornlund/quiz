import { faUser } from '@fortawesome/free-solid-svg-icons'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import CardInfoItem from './CardInfoItem'

describe('CardInfoItem', () => {
  it('renders children', () => {
    render(<CardInfoItem>Hello</CardInfoItem>)

    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders an icon when provided', () => {
    const { container } = render(
      <CardInfoItem icon={faUser}>Label</CardInfoItem>,
    )

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('does not render an icon when not provided', () => {
    const { container } = render(<CardInfoItem>Label</CardInfoItem>)

    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('applies the small class when size is small', () => {
    render(
      <CardInfoItem size="small" data-testid="item">
        Label
      </CardInfoItem>,
    )

    expect(screen.getByTestId('item')).toHaveClass('infoItemSmall')
  })

  it('does not apply the small class when size is normal', () => {
    render(
      <CardInfoItem size="normal" data-testid="item">
        Label
      </CardInfoItem>,
    )

    expect(screen.getByTestId('item')).not.toHaveClass('infoItemSmall')
  })

  it('does not apply the small class when size is not set', () => {
    render(<CardInfoItem data-testid="item">Label</CardInfoItem>)

    expect(screen.getByTestId('item')).not.toHaveClass('infoItemSmall')
  })

  it('always applies the base infoItem class', () => {
    render(<CardInfoItem data-testid="item">Label</CardInfoItem>)

    expect(screen.getByTestId('item')).toHaveClass('infoItem')
  })

  it('applies the title attribute when provided', () => {
    render(
      <CardInfoItem title="Tooltip text" data-testid="item">
        Label
      </CardInfoItem>,
    )

    expect(screen.getByTestId('item')).toHaveAttribute('title', 'Tooltip text')
  })

  it('applies data-testid to the rendered element', () => {
    render(<CardInfoItem data-testid="my-info-item">Label</CardInfoItem>)

    expect(screen.getByTestId('my-info-item')).toBeInTheDocument()
  })

  it('passes iconColor to the icon', () => {
    const { container } = render(
      <CardInfoItem icon={faUser} iconColor="#ff0000">
        Label
      </CardInfoItem>,
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
