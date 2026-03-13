import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import MediaInfoCard from './MediaInfoCard'

vi.mock('../ResponsiveImage', () => ({
  default: ({ imageURL, alt }: { imageURL?: string; alt?: string }) => (
    <img src={imageURL} alt={alt ?? ''} />
  ),
}))

describe('MediaInfoCard', () => {
  it('renders the title', () => {
    render(<MediaInfoCard title="My Card" imageAlt="alt" />)

    expect(screen.getByText('My Card')).toBeInTheDocument()
  })

  it('renders the title as a tooltip attribute', () => {
    render(<MediaInfoCard title="My Card" imageAlt="alt" data-testid="card" />)

    expect(screen.getByTitle('My Card')).toBeInTheDocument()
  })

  it('renders the cover image when imageURL is provided', () => {
    render(
      <MediaInfoCard
        title="My Card"
        imageURL="https://example.com/image.jpg"
        imageAlt="my alt"
      />,
    )

    const img = screen.getByAltText('my alt')
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  it('renders the fallback when imageURL is undefined', () => {
    render(<MediaInfoCard title="My Card" imageAlt="alt" />)

    expect(screen.getByTestId('cover-fallback')).toBeInTheDocument()
  })

  it('renders the fallback when imageURL is null', () => {
    render(<MediaInfoCard title="My Card" imageURL={null} imageAlt="alt" />)

    expect(screen.getByTestId('cover-fallback')).toBeInTheDocument()
  })

  it('renders as a button when onClick is provided', () => {
    render(<MediaInfoCard title="My Card" imageAlt="alt" onClick={vi.fn()} />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders as a div when onClick is not provided', () => {
    render(<MediaInfoCard title="My Card" imageAlt="alt" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <MediaInfoCard
        title="My Card"
        imageAlt="alt"
        onClick={onClick}
        data-testid="card"
      />,
    )

    await user.click(screen.getByTestId('card'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('calls onClick on Enter key press', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <MediaInfoCard
        title="My Card"
        imageAlt="alt"
        onClick={onClick}
        data-testid="card"
      />,
    )

    screen.getByTestId('card').focus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('calls onClick on Space key press', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <MediaInfoCard
        title="My Card"
        imageAlt="alt"
        onClick={onClick}
        data-testid="card"
      />,
    )

    screen.getByTestId('card').focus()
    await user.keyboard(' ')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('applies data-testid to the outer element', () => {
    render(
      <MediaInfoCard title="My Card" imageAlt="alt" data-testid="my-card" />,
    )

    expect(screen.getByTestId('my-card')).toBeInTheDocument()
  })

  it('applies an extra className to the outer element', () => {
    render(
      <MediaInfoCard
        title="My Card"
        imageAlt="alt"
        className="extra-class"
        data-testid="card"
      />,
    )

    expect(screen.getByTestId('card')).toHaveClass('extra-class')
  })

  it('renders info content when provided', () => {
    render(
      <MediaInfoCard
        title="My Card"
        imageAlt="alt"
        info={<span>Some info</span>}
      />,
    )

    expect(screen.getByText('Some info')).toBeInTheDocument()
  })

  it('renders meta content when provided', () => {
    render(
      <MediaInfoCard
        title="My Card"
        imageAlt="alt"
        meta={<span>Some meta</span>}
      />,
    )

    expect(screen.getByText('Some meta')).toBeInTheDocument()
  })

  it('does not render the info section when info is not provided', () => {
    render(
      <MediaInfoCard
        title="My Card"
        imageAlt="alt"
        meta={<span>Some meta</span>}
      />,
    )

    expect(screen.queryByText('Some info')).not.toBeInTheDocument()
  })

  it('does not render the meta section when meta is not provided', () => {
    render(
      <MediaInfoCard
        title="My Card"
        imageAlt="alt"
        info={<span>Some info</span>}
      />,
    )

    expect(screen.queryByText('Some meta')).not.toBeInTheDocument()
  })
})
