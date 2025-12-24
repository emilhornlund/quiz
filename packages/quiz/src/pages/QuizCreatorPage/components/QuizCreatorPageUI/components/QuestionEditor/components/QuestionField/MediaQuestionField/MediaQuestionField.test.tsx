import { MediaType, QuestionImageRevealEffectType } from '@quiz/common'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ValidationResult } from '../../../../../../../../../validation'

import MediaQuestionField from './MediaQuestionField'

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
    customErrorMessages,
    onChange,
    onClose,
  }: {
    type?: string
    url?: string
    customErrorMessages?: Record<string, string | undefined>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (v: any) => void
    onClose: () => void
    disableValidation?: boolean
  }) => (
    <div
      data-testid="media-modal"
      data-type={type ?? ''}
      data-url={url ?? ''}
      data-err-type={customErrorMessages?.type ?? ''}
      data-err-url={customErrorMessages?.url ?? ''}>
      <button
        onClick={() => {
          onChange({ type: MediaType.Image, url: 'https://cdn/new.jpg' })
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
    revealEffect?: {
      type: QuestionImageRevealEffectType
      countdown: {
        initiatedTime: string
        expiryTime: string
        serverTime: string
      }
    }
  }) => (
    <div
      data-testid="responsive-image"
      data-url={imageURL}
      data-effect={revealEffect?.type ?? ''}
      data-initiated={revealEffect?.countdown?.initiatedTime ?? ''}
      data-expiry={revealEffect?.countdown?.expiryTime ?? ''}
      data-server={revealEffect?.countdown?.serverTime ?? ''}
    />
  ),

  ResponsivePlayer: ({ url }: { url: string }) => (
    <div data-testid="responsive-player" data-url={url} />
  ),
}))

vi.mock('./components', () => ({
  ImageEffectModal: ({
    value,
    onClose,
    onChangeImageEffect,
  }: {
    value?: QuestionImageRevealEffectType
    validation: unknown
    onClose: () => void
    onChangeImageEffect: (e: QuestionImageRevealEffectType | undefined) => void
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

type AnyValidation = ValidationResult<Record<string, unknown>>

function makeValidation(
  errors: Array<{ path: string; message: string }> = [],
): AnyValidation {
  // Your ValidationError requires `code`. We don’t care about it in these tests,
  // so provide a dummy value via casting.
  return {
    valid: errors.length === 0,
    errors: errors.map((e) => ({
      path: e.path,
      message: e.message,
      code: 'test', // satisfies ValidationError compile-time requirement
    })),
  } as unknown as AnyValidation
}

describe('MediaQuestionField', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Add media" when no value and opens MediaModal on click', () => {
    const onChange = vi.fn()

    render(
      <MediaQuestionField onChange={onChange} validation={makeValidation()} />,
    )

    fireEvent.click(screen.getByRole('button', { name: /add media/i }))
    expect(screen.getByTestId('media-modal')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /choose-media/i }))
    expect(onChange).toHaveBeenCalledWith({
      type: MediaType.Image,
      url: 'https://cdn/new.jpg',
    })

    fireEvent.click(screen.getByRole('button', { name: /close-media/i }))
    expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument()
  })

  it('passes validation errors to MediaModal as customErrorMessages', () => {
    const onChange = vi.fn()

    render(
      <MediaQuestionField
        onChange={onChange}
        validation={makeValidation([
          { path: 'media.type', message: 'Type error' },
          { path: 'media.url', message: 'URL error' },
        ])}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /add media/i }))

    const modal = screen.getByTestId('media-modal')
    expect(modal).toHaveAttribute('data-err-type', 'Type error')
    expect(modal).toHaveAttribute('data-err-url', 'URL error')
  })

  it('renders image preview (without revealEffect) and shows Image Effect action', () => {
    const onChange = vi.fn()

    render(
      <MediaQuestionField
        value={{ type: MediaType.Image, url: 'https://cdn/pic.jpg' }}
        onChange={onChange}
        validation={makeValidation()}
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

  it('passes revealEffect to ResponsiveImage when value.effect is set and duration is provided', () => {
    const onChange = vi.fn()
    const now = 1_700_000_000_000
    vi.spyOn(Date, 'now').mockReturnValue(now)

    render(
      <MediaQuestionField
        value={{
          type: MediaType.Image,
          url: 'https://cdn/pic.jpg',
          effect: QuestionImageRevealEffectType.Square3x3,
        }}
        duration={30}
        onChange={onChange}
        validation={makeValidation()}
      />,
    )

    const img = screen.getByTestId('responsive-image')
    expect(img).toHaveAttribute(
      'data-effect',
      QuestionImageRevealEffectType.Square3x3,
    )
    expect(img).toHaveAttribute('data-initiated', new Date(now).toISOString())
    expect(img).toHaveAttribute('data-server', new Date(now).toISOString())
    expect(img).toHaveAttribute(
      'data-expiry',
      new Date(now + 30_000).toISOString(),
    )

    vi.restoreAllMocks()
  })

  it('delete clears media', () => {
    const onChange = vi.fn()

    render(
      <MediaQuestionField
        value={{ type: MediaType.Image, url: 'https://cdn/pic.jpg' }}
        onChange={onChange}
        validation={makeValidation()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  it('replace opens MediaModal and selecting media triggers onChange', () => {
    const onChange = vi.fn()

    render(
      <MediaQuestionField
        value={{ type: MediaType.Video, url: 'https://vid/url.mp4' }}
        onChange={onChange}
        validation={makeValidation()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /replace/i }))

    const modal = screen.getByTestId('media-modal')
    expect(modal).toHaveAttribute('data-type', MediaType.Video)
    expect(modal).toHaveAttribute('data-url', 'https://vid/url.mp4')

    fireEvent.click(
      within(modal).getByRole('button', { name: /choose-media/i }),
    )
    expect(onChange).toHaveBeenCalledWith({
      type: MediaType.Image,
      url: 'https://cdn/new.jpg',
    })
  })

  it('clicking "Image Effect" opens ImageEffectModal and updates effect via callbacks', () => {
    const onChange = vi.fn()
    const base = { type: MediaType.Image, url: 'https://cdn/pic.jpg' } as const

    render(
      <MediaQuestionField
        value={{ ...base }}
        onChange={onChange}
        validation={makeValidation()}
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
    const onChange = vi.fn()

    render(
      <MediaQuestionField
        value={{ type: MediaType.Video, url: 'https://cdn/video.mp4' }}
        onChange={onChange}
        validation={makeValidation()}
      />,
    )

    expect(screen.getByTestId('responsive-player')).toHaveAttribute(
      'data-url',
      'https://cdn/video.mp4',
    )
    expect(screen.queryByRole('button', { name: /image effect/i })).toBeNull()
  })

  it('does not show "Image Effect" action for audio and renders player', () => {
    const onChange = vi.fn()

    render(
      <MediaQuestionField
        value={{ type: MediaType.Audio, url: 'https://cdn/audio.mp3' }}
        onChange={onChange}
        validation={makeValidation()}
      />,
    )

    expect(screen.getByTestId('responsive-player')).toHaveAttribute(
      'data-url',
      'https://cdn/audio.mp3',
    )
    expect(screen.queryByRole('button', { name: /image effect/i })).toBeNull()
  })
})
