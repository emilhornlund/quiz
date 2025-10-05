import { MediaType, QuestionType } from '@quiz/common'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Minimal, typed component mocks so we can assert on the props
 */
vi.mock('../../../components/ResponsiveImage', () => {
  const Mock: React.FC<{ imageURL: string; alt?: string }> = ({
    imageURL,
    alt,
  }) => (
    <img data-testid="responsive-image" data-src={imageURL} alt={alt ?? ''} />
  )
  return { default: Mock }
})

vi.mock('../../../components/ResponsivePlayer', () => {
  const Mock: React.FC<{ url: string }> = ({ url }) => (
    <div data-testid="responsive-player" data-url={url} />
  )
  return { default: Mock }
})

import QuestionMedia from './QuestionMedia'

describe('QuestionMedia', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when no media provided', () => {
    const { container } = render(
      <QuestionMedia type={QuestionType.MultiChoice} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('returns null when type is Pin even if media is provided', () => {
    const { container, rerender } = render(
      <QuestionMedia
        type={QuestionType.Pin}
        media={{ type: MediaType.Image, url: 'https://img/a.jpg' }}
      />,
    )
    expect(container.firstChild).toBeNull()

    rerender(
      <QuestionMedia
        type={QuestionType.Pin}
        media={{ type: MediaType.Audio, url: 'https://cdn/a.mp3' }}
      />,
    )
    expect(container.firstChild).toBeNull()

    rerender(
      <QuestionMedia
        type={QuestionType.Pin}
        media={{ type: MediaType.Video, url: 'https://cdn/v.mp4' }}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders ResponsiveImage for image media when type is not Pin (snapshot)', () => {
    const { container } = render(
      <QuestionMedia
        type={QuestionType.MultiChoice}
        media={{ type: MediaType.Image, url: 'https://img/a.jpg' }}
        alt="cute cat"
      />,
    )
    const img = screen.getByTestId('responsive-image')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('data-src', 'https://img/a.jpg')
    expect(img).toHaveAttribute('alt', 'cute cat')
    // No player
    expect(screen.queryByTestId('responsive-player')).toBeNull()
    expect(container).toMatchSnapshot()
  })

  it('renders ResponsivePlayer for audio media (snapshot)', () => {
    const { container } = render(
      <QuestionMedia
        type={QuestionType.TrueFalse}
        media={{ type: MediaType.Audio, url: 'https://cdn/a.mp3' }}
      />,
    )
    const player = screen.getByTestId('responsive-player')
    expect(player).toBeInTheDocument()
    expect(player).toHaveAttribute('data-url', 'https://cdn/a.mp3')
    // No image
    expect(screen.queryByTestId('responsive-image')).toBeNull()
    expect(container).toMatchSnapshot()
  })

  it('renders ResponsivePlayer for video media (snapshot)', () => {
    const { container } = render(
      <QuestionMedia
        type={QuestionType.MultiChoice}
        media={{ type: MediaType.Video, url: 'https://cdn/v.mp4' }}
      />,
    )
    const player = screen.getByTestId('responsive-player')
    expect(player).toBeInTheDocument()
    expect(player).toHaveAttribute('data-url', 'https://cdn/v.mp4')
    // No image
    expect(screen.queryByTestId('responsive-image')).toBeNull()
    expect(container).toMatchSnapshot()
  })

  it('updates correctly when media changes from image to video', () => {
    const { rerender } = render(
      <QuestionMedia
        type={QuestionType.MultiChoice}
        media={{ type: MediaType.Image, url: 'https://img/a.jpg' }}
        alt="img"
      />,
    )
    expect(screen.getByTestId('responsive-image')).toBeInTheDocument()
    expect(screen.queryByTestId('responsive-player')).toBeNull()

    rerender(
      <QuestionMedia
        type={QuestionType.MultiChoice}
        media={{ type: MediaType.Video, url: 'https://cdn/v.mp4' }}
        alt="img"
      />,
    )
    expect(screen.getByTestId('responsive-player')).toBeInTheDocument()
    expect(screen.queryByTestId('responsive-image')).toBeNull()
  })
})
