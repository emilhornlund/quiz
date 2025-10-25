import { MediaType, QuestionImageRevealEffectType } from '@quiz/common'
import { fireEvent, render, screen, within } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Stub shared components used inside MediaQuestionField
vi.mock('../../../../../../../../../components', () => ({
  Button: ({
    id,
    value,
    onClick,
  }: {
    id?: string
    value?: string
    onClick?: () => void
  }) => (
    <button id={id} onClick={onClick}>
      {value ?? id}
    </button>
  ),

  MediaModal: ({
    type,
    url,
    onChange,
    onValid,
    onClose,
  }: {
    type?: string
    url?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (v: any) => void
    onValid: (v: boolean) => void
    onClose: () => void
  }) => (
    <div data-testid="media-modal" data-type={type ?? ''} data-url={url ?? ''}>
      <button
        onClick={() => {
          onChange({ type: MediaType.Image, url: 'https://cdn/new.jpg' })
          onValid(true)
        }}>
        choose-media
      </button>
      <button onClick={onClose}>close-media</button>
    </div>
  ),

  ResponsiveImage: ({
    imageURL,
    revealEffect,
  }: {
    imageURL: string
    revealEffect?: { type: string }
  }) => (
    <div
      data-testid="responsive-image"
      data-url={imageURL}
      data-effect={revealEffect?.type ?? ''}
    />
  ),

  ResponsivePlayer: ({ url }: { url: string }) => (
    <div data-testid="responsive-player" data-url={url} />
  ),
}))

// Stub ImageEffectModal from local "./components"
vi.mock('./components', () => ({
  ImageEffectModal: ({
    value,
    onClose,
    onChangeImageEffect,
  }: {
    value?: string
    onClose: () => void
    onChangeImageEffect: (e: string | undefined) => void
  }) => (
    <div data-testid="image-effect-modal" data-value={value ?? ''}>
      <button
        onClick={() => onChangeImageEffect(QuestionImageRevealEffectType.Blur)}>
        set-blur
      </button>
      <button onClick={() => onChangeImageEffect(undefined)}>
        clear-effect
      </button>
      <button onClick={onClose}>close-image-effect</button>
    </div>
  ),
}))

import MediaQuestionField from './MediaQuestionField'

describe('MediaQuestionField', () => {
  const makeHandlers = () => ({
    onChange: vi.fn(),
    onValid: vi.fn(),
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Add media" when no value and opens MediaModal on click', () => {
    const { onChange, onValid } = makeHandlers()
    render(<MediaQuestionField onChange={onChange} onValid={onValid} />)

    const addBtn = screen.getByRole('button', { name: /add media/i })
    fireEvent.click(addBtn)

    const modal = screen.getByTestId('media-modal')
    expect(modal).toBeInTheDocument()

    // choose media triggers onChange + onValid(true)
    fireEvent.click(
      within(modal).getByRole('button', { name: /choose-media/i }),
    )
    expect(onChange).toHaveBeenCalledWith({
      type: MediaType.Image,
      url: 'https://cdn/new.jpg',
    })
    expect(onValid).toHaveBeenCalledWith(true)

    // close modal
    fireEvent.click(within(modal).getByRole('button', { name: /close-media/i }))
    expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument()
  })

  it('renders image preview (without effect) and shows Image Effect action', () => {
    const { onChange, onValid } = makeHandlers()
    render(
      <MediaQuestionField
        value={{ type: MediaType.Image, url: 'https://cdn/pic.jpg' }}
        onChange={onChange}
        onValid={onValid}
      />,
    )

    const img = screen.getByTestId('responsive-image')
    expect(img).toHaveAttribute('data-url', 'https://cdn/pic.jpg')
    expect(img).toHaveAttribute('data-effect', '')

    expect(
      screen.getByRole('button', { name: /image effect/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /replace/i })).toBeInTheDocument()
  })

  it('passes revealEffect to ResponsiveImage when value.effect is set', () => {
    const { onChange, onValid } = makeHandlers()
    render(
      <MediaQuestionField
        value={{
          type: MediaType.Image,
          url: 'https://cdn/pic.jpg',
          effect: QuestionImageRevealEffectType.Square3x3,
        }}
        onChange={onChange}
        onValid={onValid}
      />,
    )

    const img = screen.getByTestId('responsive-image')
    expect(img).toHaveAttribute('data-url', 'https://cdn/pic.jpg')
    expect(img).toHaveAttribute(
      'data-effect',
      QuestionImageRevealEffectType.Square3x3,
    )
  })

  it('delete clears media and marks valid', () => {
    const { onChange, onValid } = makeHandlers()
    render(
      <MediaQuestionField
        value={{ type: MediaType.Image, url: 'https://cdn/pic.jpg' }}
        onChange={onChange}
        onValid={onValid}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onChange).toHaveBeenCalledWith(undefined)
    expect(onValid).toHaveBeenCalledWith(true)
  })

  it('replace opens MediaModal and selecting media triggers onChange', () => {
    const { onChange, onValid } = makeHandlers()
    render(
      <MediaQuestionField
        value={{ type: MediaType.Video, url: 'https://vid/url.mp4' }}
        onChange={onChange}
        onValid={onValid}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /replace/i }))
    const modal = screen.getByTestId('media-modal')
    fireEvent.click(
      within(modal).getByRole('button', { name: /choose-media/i }),
    )
    expect(onChange).toHaveBeenCalledWith({
      type: MediaType.Image,
      url: 'https://cdn/new.jpg',
    })
    expect(onValid).toHaveBeenCalledWith(true)
  })

  it('clicking "Image Effect" opens ImageEffectModal and updates effect via callbacks', () => {
    const { onChange, onValid } = makeHandlers()
    const base = {
      type: MediaType.Image,
      url: 'https://cdn/pic.jpg',
    } as const

    render(
      <MediaQuestionField
        value={{ ...base }}
        onChange={onChange}
        onValid={onValid}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /image effect/i }))
    const effectModal = screen.getByTestId('image-effect-modal')
    expect(effectModal).toBeInTheDocument()

    fireEvent.click(
      within(effectModal).getByRole('button', { name: /set-blur/i }),
    )
    expect(onChange).toHaveBeenCalledWith({
      ...base,
      effect: QuestionImageRevealEffectType.Blur,
    })

    fireEvent.click(
      within(effectModal).getByRole('button', { name: /clear-effect/i }),
    )
    expect(onChange).toHaveBeenCalledWith({ ...base, effect: undefined })

    fireEvent.click(
      within(effectModal).getByRole('button', { name: /close-image-effect/i }),
    )
    expect(screen.queryByTestId('image-effect-modal')).not.toBeInTheDocument()
  })

  it('does not show "Image Effect" action for video and renders player', () => {
    const { onChange, onValid } = makeHandlers()
    render(
      <MediaQuestionField
        value={{ type: MediaType.Video, url: 'https://cdn/video.mp4' }}
        onChange={onChange}
        onValid={onValid}
      />,
    )

    expect(screen.getByTestId('responsive-player')).toHaveAttribute(
      'data-url',
      'https://cdn/video.mp4',
    )
    expect(screen.queryByRole('button', { name: /image effect/i })).toBeNull()
  })

  it('does not show "Image Effect" action for audio and renders player', () => {
    const { onChange, onValid } = makeHandlers()
    render(
      <MediaQuestionField
        value={{ type: MediaType.Audio, url: 'https://cdn/audio.mp3' }}
        onChange={onChange}
        onValid={onValid}
      />,
    )

    expect(screen.getByTestId('responsive-player')).toHaveAttribute(
      'data-url',
      'https://cdn/audio.mp3',
    )
    expect(screen.queryByRole('button', { name: /image effect/i })).toBeNull()
  })
})
