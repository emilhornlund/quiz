import {
  CountdownEvent,
  MediaType,
  QuestionImageRevealEffectType,
  QuestionType,
} from '@quiz/common'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../components/ResponsiveImage', () => {
  const Mock: React.FC<{
    imageURL: string
    alt?: string
    revealEffect?: { type: QuestionImageRevealEffectType; countdown?: unknown }
  }> = ({ imageURL, alt, revealEffect }) => (
    <img
      data-testid="responsive-image"
      data-src={imageURL}
      alt={alt ?? ''}
      data-effect-type={revealEffect?.type ?? ''}
      data-has-countdown={revealEffect?.countdown ? 'true' : 'false'}
    />
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

  it('renders ResponsiveImage for image media when type is not Pin', () => {
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

  it('renders ResponsivePlayer for audio media', () => {
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

  it('renders ResponsivePlayer for video media', () => {
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

  it('renders container wrapper when image is shown', () => {
    render(
      <QuestionMedia
        type={QuestionType.MultiChoice}
        media={{ type: MediaType.Image, url: 'https://img/cat.jpg' }}
        alt="cat"
      />,
    )
    expect(screen.getByTestId('question-media')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-image')).toBeInTheDocument()
    expect(screen.queryByTestId('responsive-player')).toBeNull()
  })

  it('renders container wrapper when audio is shown', () => {
    render(
      <QuestionMedia
        type={QuestionType.TrueFalse}
        media={{ type: MediaType.Audio, url: 'https://cdn/a.mp3' }}
      />,
    )
    expect(screen.getByTestId('question-media')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-player')).toBeInTheDocument()
    expect(screen.queryByTestId('responsive-image')).toBeNull()
  })

  it('passes revealEffect.type and countdown to ResponsiveImage when provided', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countdown = { remainingMs: 5000 } as unknown as any

    render(
      <QuestionMedia
        type={QuestionType.MultiChoice}
        media={{
          type: MediaType.Image,
          url: 'https://img/effect.jpg',
          effect: QuestionImageRevealEffectType.Square3x3,
        }}
        countdown={countdown}
        alt="with effect"
      />,
    )

    const img = screen.getByTestId('responsive-image')
    expect(img).toHaveAttribute('data-src', 'https://img/effect.jpg')
    expect(img).toHaveAttribute(
      'data-effect-type',
      String(QuestionImageRevealEffectType.Square3x3),
    )
    expect(img).toHaveAttribute('data-has-countdown', 'true')
  })

  it('does not pass revealEffect when effect is missing on image media', () => {
    render(
      <QuestionMedia
        type={QuestionType.MultiChoice}
        media={{ type: MediaType.Image, url: 'https://img/no-effect.jpg' }}
      />,
    )

    const img = screen.getByTestId('responsive-image')
    // attribute present but empty due to mock implementation
    expect(img.getAttribute('data-effect-type')).toBe('')
    expect(img.getAttribute('data-has-countdown')).toBe('false')
  })

  it('uses empty alt string when alt prop is undefined', () => {
    render(
      <QuestionMedia
        type={QuestionType.MultiChoice}
        media={{ type: MediaType.Image, url: 'https://img/alt.jpg' }}
      />,
    )
    const img = screen.getByTestId('responsive-image')
    expect(img).toHaveAttribute('alt', '')
  })

  it('returns null when image URL is empty string', () => {
    const { container } = render(
      <QuestionMedia
        type={QuestionType.MultiChoice}
        media={{ type: MediaType.Image, url: '' }}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('unmounts content when switching to Pin after rendering media', () => {
    const { rerender, container } = render(
      <QuestionMedia
        type={QuestionType.MultiChoice}
        media={{ type: MediaType.Video, url: 'https://cdn/v.mp4' }}
      />,
    )
    expect(screen.getByTestId('responsive-player')).toBeInTheDocument()

    rerender(
      <QuestionMedia
        type={QuestionType.Pin}
        media={{ type: MediaType.Video, url: 'https://cdn/v.mp4' }}
      />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('switches from audio to image (and applies effect) correctly', () => {
    const { rerender } = render(
      <QuestionMedia
        type={QuestionType.TrueFalse}
        media={{ type: MediaType.Audio, url: 'https://cdn/a.mp3' }}
      />,
    )
    expect(screen.getByTestId('responsive-player')).toBeInTheDocument()
    expect(screen.queryByTestId('responsive-image')).toBeNull()

    const countdown: CountdownEvent = {
      serverTime: '2025-10-12T12:00:00.000Z',
      initiatedTime: '2025-10-12T11:59:59.000Z',
      expiryTime: '2025-10-12T12:00:01.000Z',
    }

    rerender(
      <QuestionMedia
        type={QuestionType.TrueFalse}
        media={{
          type: MediaType.Image,
          url: 'https://img/switch.jpg',
          effect: QuestionImageRevealEffectType.Square3x3,
        }}
        countdown={countdown}
      />,
    )

    const img = screen.getByTestId('responsive-image')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('data-src', 'https://img/switch.jpg')
    expect(img.getAttribute('data-effect-type')).toBe(
      String(QuestionImageRevealEffectType.Square3x3),
    )
    expect(screen.queryByTestId('responsive-player')).toBeNull()
  })
})
