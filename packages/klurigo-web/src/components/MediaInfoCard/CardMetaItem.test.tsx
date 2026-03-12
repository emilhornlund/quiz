import { faStar } from '@fortawesome/free-solid-svg-icons'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import CardMetaItem from './CardMetaItem'

describe('CardMetaItem', () => {
  it('renders children', () => {
    render(<CardMetaItem>42</CardMetaItem>)

    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders an icon when provided', () => {
    const { container } = render(<CardMetaItem icon={faStar}>4.5</CardMetaItem>)

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('does not render an icon when not provided', () => {
    const { container } = render(<CardMetaItem>4.5</CardMetaItem>)

    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('applies textColor as inline color style when provided', () => {
    render(
      <CardMetaItem textColor="#ffcc00" data-testid="item">
        Label
      </CardMetaItem>,
    )

    expect(screen.getByTestId('item')).toHaveStyle({ color: '#ffcc00' })
  })

  it('does not apply a color style when textColor is not provided', () => {
    render(<CardMetaItem data-testid="item">Label</CardMetaItem>)

    expect(screen.getByTestId('item').style.color).toBe('')
  })

  it('applies the title attribute when provided', () => {
    render(
      <CardMetaItem title="Tooltip" data-testid="item">
        Label
      </CardMetaItem>,
    )

    expect(screen.getByTestId('item')).toHaveAttribute('title', 'Tooltip')
  })

  it('applies data-testid to the rendered element', () => {
    render(<CardMetaItem data-testid="meta-item">Label</CardMetaItem>)

    expect(screen.getByTestId('meta-item')).toBeInTheDocument()
  })

  it('always applies the base metaItem class', () => {
    render(<CardMetaItem data-testid="item">Label</CardMetaItem>)

    expect(screen.getByTestId('item')).toHaveClass('metaItem')
  })

  it('passes iconColor to the icon', () => {
    const { container } = render(
      <CardMetaItem icon={faStar} iconColor="#ffd700">
        5.0
      </CardMetaItem>,
    )

    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
