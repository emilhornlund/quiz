import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Typography from './Typography'

vi.mock('./Typography.module.scss', () => ({
  default: {
    typography: 'typography',
    hero: 'hero',
    title: 'title',
    subtitle: 'subtitle',
    text: 'text',
    link: 'link',
    small: 'small',
    medium: 'medium',
    full: 'full',
  },
}))

describe('Typography', () => {
  it('renders a <p> by default (variant=text) with full size', () => {
    render(<Typography>Hello</Typography>)

    const el = screen.getByText('Hello')
    expect(el.tagName.toLowerCase()).toBe('p')
    expect(el).toHaveClass('typography')
    expect(el).toHaveClass('text')
    expect(el).toHaveClass('full')
  })

  it('renders semantic elements for each variant', () => {
    const { rerender } = render(<Typography variant="hero">Hero</Typography>)
    expect(screen.getByText('Hero').tagName.toLowerCase()).toBe('h1')

    rerender(<Typography variant="title">Title</Typography>)
    expect(screen.getByText('Title').tagName.toLowerCase()).toBe('h1')

    rerender(<Typography variant="subtitle">Subtitle</Typography>)
    expect(screen.getByText('Subtitle').tagName.toLowerCase()).toBe('h2')

    rerender(<Typography variant="text">Text</Typography>)
    expect(screen.getByText('Text').tagName.toLowerCase()).toBe('p')

    rerender(
      <Typography variant="link" href="https://example.com">
        Link
      </Typography>,
    )
    expect(screen.getByText('Link').tagName.toLowerCase()).toBe('a')
  })

  it('applies size modifier classes', () => {
    const { rerender } = render(
      <Typography variant="text" size="small">
        Small
      </Typography>,
    )
    expect(screen.getByText('Small')).toHaveClass('small')

    rerender(
      <Typography variant="text" size="medium">
        Medium
      </Typography>,
    )
    expect(screen.getByText('Medium')).toHaveClass('medium')

    rerender(
      <Typography variant="text" size="full">
        Full
      </Typography>,
    )
    expect(screen.getByText('Full')).toHaveClass('full')
  })

  it('includes a custom className in the resolved classes', () => {
    render(
      <Typography variant="title" className="extra-class">
        Title
      </Typography>,
    )

    expect(screen.getByText('Title')).toHaveClass('extra-class')
  })

  it('forwards link attributes only for the link variant', () => {
    render(
      <Typography
        variant="link"
        href="/somewhere"
        target="_blank"
        rel="noreferrer"
        download="file.txt">
        Go
      </Typography>,
    )

    const el = screen.getByText('Go') as HTMLAnchorElement
    expect(el.tagName.toLowerCase()).toBe('a')
    expect(el.getAttribute('href')).toBe('/somewhere')
    expect(el.getAttribute('target')).toBe('_blank')
    expect(el.getAttribute('rel')).toBe('noreferrer')
    expect(el.getAttribute('download')).toBe('file.txt')
    expect(el).toHaveClass('link')
  })

  it('forwards aria attributes and data attributes', () => {
    render(
      <Typography
        variant="text"
        aria-label="Accessible label"
        aria-live="polite"
        data-testid="typography"
        data-tracking-id="abc123">
        Content
      </Typography>,
    )

    const el = screen.getByTestId('typography')
    expect(el).toHaveAttribute('aria-label', 'Accessible label')
    expect(el).toHaveAttribute('aria-live', 'polite')
    expect(el).toHaveAttribute('data-tracking-id', 'abc123')
  })

  it('forwards standard DOM props like id, title, role, and tabIndex', () => {
    render(
      <Typography
        variant="subtitle"
        id="subtitle-id"
        title="tooltip"
        role="heading"
        tabIndex={0}>
        Subtitle
      </Typography>,
    )

    const el = screen.getByText('Subtitle')
    expect(el).toHaveAttribute('id', 'subtitle-id')
    expect(el).toHaveAttribute('title', 'tooltip')
    expect(el).toHaveAttribute('role', 'heading')
    expect(el).toHaveAttribute('tabindex', '0')
  })

  it('forwards onClick and onKeyDown handlers', () => {
    const onClick = vi.fn()
    const onKeyDown = vi.fn()

    render(
      <Typography variant="text" onClick={onClick} onKeyDown={onKeyDown}>
        Clickable
      </Typography>,
    )

    const el = screen.getByText('Clickable')
    fireEvent.click(el)
    expect(onClick).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(el, { key: 'Enter' })
    expect(onKeyDown).toHaveBeenCalledTimes(1)
  })

  it('matches snapshot for hero variant', () => {
    const { asFragment } = render(
      <Typography variant="hero" size="medium">
        Let’s play
      </Typography>,
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('matches snapshot for title variant', () => {
    const { asFragment } = render(
      <Typography variant="title" size="small">
        Leaderboard
      </Typography>,
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('matches snapshot for link variant', () => {
    const { asFragment } = render(
      <Typography variant="link" href="/profile" size="full">
        Profile
      </Typography>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
