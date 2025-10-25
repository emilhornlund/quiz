import { QuestionImageRevealEffectType } from '@quiz/common'
import { act, render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ResponsiveImage from './ResponsiveImage'

// Image mock: synchronous load/error so we don't need timers.
class MockImage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onload: null | ((ev?: any) => any) = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onerror: null | ((ev?: any) => any) = null
  naturalWidth = 400
  naturalHeight = 300
  set src(val: string) {
    // Treat "bad" and any "invalid-*" as error to match tests using "invalid-url"
    if (!val || val === 'bad' || val.startsWith('invalid')) {
      this.onerror?.(new Event('error'))
    } else {
      this.onload?.(new Event('load'))
    }
  }
}
vi.stubGlobal('Image', MockImage as unknown as typeof Image)

// Fire onResize only once per test to avoid render loops.
let didNotifyResize = false

// useResizeObserver: your component passes onResize that expects {width,height}.
const resizeObserverImpl = vi.fn(
  ({
    onResize,
  }: {
    onResize: (size: { width: number; height: number }) => void
  }) => {
    if (!didNotifyResize) {
      didNotifyResize = true
      onResize({ width: 800, height: 600 })
    }
  },
)

// Debounce: return the original fn (immediate pass-through).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debounceImpl = (fn: (...args: any[]) => void) => fn

vi.mock('usehooks-ts', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useResizeObserver: (args: any) => resizeObserverImpl(args),
  useDebounceCallback: (fn: unknown) =>
    debounceImpl(fn as (...args: unknown[]) => void),
}))

// Blur style hook: return a visible style so we can assert.
vi.mock('./hook', () => ({
  useImageBlurEffect: (countdown?: unknown) =>
    countdown ? { filter: 'blur(8px)' } : { filter: 'blur(0px)' },
}))

// Lightweight UI mocks
vi.mock('../index.ts', () => ({
  LoadingSpinner: () => <div data-testid="spinner" />,
  Typography: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="typography">{children}</div>
  ),
}))

// Square effect mock to assert it renders and receives box/effect.
vi.mock('./components', () => ({
  ImageSquareEffect: ({
    box,
    effect,
  }: {
    box: { w: number; h: number }
    effect: QuestionImageRevealEffectType
  }) => (
    <div
      data-testid="square-effect"
      data-w={box.w}
      data-h={box.h}
      data-effect={String(effect)}
    />
  ),
}))

describe('ResponsiveImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    didNotifyResize = false
  })

  it('should render ResponsiveImage with props', async () => {
    const { container } = render(
      <ResponsiveImage
        imageURL="https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg"
        alt="Who painted The Starry Night?"
      />,
    )
    expect(container).toMatchSnapshot()
  })

  it('should render loading state', () => {
    const { container } = render(<ResponsiveImage alt="loading" />)
    expect(container).toMatchSnapshot()
  })

  it('should render error state', async () => {
    const { container } = render(
      <ResponsiveImage imageURL="invalid-url" alt="error" />,
    )
    // ensure effects (phase transition) have flushed
    await act(async () => {})
    expect(container).toMatchSnapshot()
  })

  it('should render with blur effect', () => {
    const { container } = render(
      <ResponsiveImage
        imageURL="https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg"
        alt="blur"
        revealEffect={{ type: QuestionImageRevealEffectType.Blur }}
      />,
    )
    expect(container).toMatchSnapshot()
  })

  it('should render with square effect', () => {
    const { container } = render(
      <ResponsiveImage
        imageURL="https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg"
        alt="square"
        revealEffect={{ type: QuestionImageRevealEffectType.Square3x3 }}
      />,
    )
    expect(container).toMatchSnapshot()
  })

  it('should render with overlay children', () => {
    const { container } = render(
      <ResponsiveImage
        imageURL="https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg"
        alt="overlay">
        <span>Overlay Content</span>
      </ResponsiveImage>,
    )
    expect(container).toMatchSnapshot()
  })

  it('should render with noBorder', () => {
    const { container } = render(
      <ResponsiveImage
        imageURL="https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg"
        alt="noBorder"
        noBorder
      />,
    )
    expect(container).toMatchSnapshot()
  })

  it('computes box size from container and intrinsic dims (800x600 from 400x300 * 2)', async () => {
    const { container } = render(
      <ResponsiveImage imageURL="https://cdn/img.jpg" alt="computed" />,
    )

    // allow Image.onload & state updates to flush
    await act(async () => {})

    // wrapper that appears only in ready+box state
    const box = container.querySelector('[class*="box"]')
    expect(box).toBeTruthy()
    // inline styles
    expect((box as HTMLElement).style.width).toBe('800px')
    expect((box as HTMLElement).style.height).toBe('600px')

    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://cdn/img.jpg')
    expect(img).toHaveAttribute('alt', 'computed')
  })

  it('shows loading overlay while image is loading (before onload fires)', async () => {
    // Temporarily override Image to never resolve
    class LoadingImage {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onload: null | ((ev?: any) => any) = null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onerror: null | ((ev?: any) => any) = null
      naturalWidth = 0
      naturalHeight = 0
      set src(_val: string) {
        // never call onload/onerror -> stays "loading"
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prev = (globalThis as any).Image
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).Image = LoadingImage

    const { container, unmount } = render(
      <ResponsiveImage imageURL="https://cdn/slow.jpg" alt="loading" />,
    )
    // ensure effects (phase=loading) are applied
    await act(async () => {})

    expect(screen.getByTestId('spinner')).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()

    unmount()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).Image = prev
  })

  it('shows error overlay when image fails to load', async () => {
    const { container } = render(<ResponsiveImage imageURL="bad" alt="err" />)
    await act(async () => {}) // allow onerror phase to apply
    // error overlay (Typography mocked)
    expect(screen.getByTestId('typography')).toHaveTextContent(
      'Oh no! Unable to load image',
    )
    // no img rendered
    const img = container.querySelector('img')
    expect(img).toBeNull()
  })

  it('applies Blur effect style via hook and does NOT render square effect', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countdown = { remainingMs: 3000 } as any
    const { container } = render(
      <ResponsiveImage
        imageURL="https://cdn/blur.jpg"
        alt="blur"
        revealEffect={{ type: QuestionImageRevealEffectType.Blur, countdown }}
      />,
    )
    await act(async () => {})

    const img = container.querySelector('img') as HTMLImageElement
    // Blur style returned from mocked hook
    expect(img.getAttribute('style') || '').toMatch(/blur\(8px\)/i)

    // No square effect component for Blur
    expect(screen.queryByTestId('square-effect')).toBeNull()
  })

  it('renders ImageSquareEffect for Square3x3 and passes box + effect', async () => {
    const { container } = render(
      <ResponsiveImage
        imageURL="https://cdn/tiles.jpg"
        alt="squares"
        revealEffect={{ type: QuestionImageRevealEffectType.Square3x3 }}
      />,
    )
    await act(async () => {})

    const square = screen.getByTestId('square-effect')
    expect(square).toBeInTheDocument()
    // From earlier computed box (800x600)
    expect(square).toHaveAttribute('data-w', '800')
    expect(square).toHaveAttribute('data-h', '600')
    expect(square).toHaveAttribute(
      'data-effect',
      String(QuestionImageRevealEffectType.Square3x3),
    )

    // img rendered normally (no blur style)
    const img = container.querySelector('img') as HTMLImageElement
    expect(img.getAttribute('style') || '').not.toMatch(/blur/i)
  })

  it('respects noBorder by using the boxNoBorder class', async () => {
    const { container } = render(
      <ResponsiveImage
        imageURL="https://cdn/noborder.jpg"
        alt="noBorder"
        noBorder
      />,
    )
    await act(async () => {})

    const box = container.querySelector('[class*="boxNoBorder"]')
    expect(box).toBeTruthy()
    const bordered = container.querySelector(
      '[class*="box"]:not([class*="boxNoBorder"])',
    )
    expect(bordered).toBeNull()
  })

  it('renders children into overlay when provided', async () => {
    const { container } = render(
      <ResponsiveImage imageURL="https://cdn/overlay.jpg" alt="overlay">
        <span data-testid="overlay-child">Overlay Content</span>
      </ResponsiveImage>,
    )
    await act(async () => {})

    const overlayChild = screen.getByTestId('overlay-child')
    expect(overlayChild).toBeInTheDocument()

    // ensure overlay wrapper exists
    const overlay = container.querySelector('[class*="overlay"]')
    expect(overlay).toBeTruthy()
  })

  it('resets to idle (no content) when imageURL becomes undefined after being set', async () => {
    const { rerender, container } = render(
      <ResponsiveImage imageURL="https://cdn/once.jpg" alt="once" />,
    )
    await act(async () => {})
    expect(container.querySelector('img')).toBeTruthy()

    // Drop URL -> should clear displaySrc/phase/intrinsic and render nothing (no spinner, no error)
    rerender(<ResponsiveImage alt="idle" />)
    await act(async () => {})

    expect(container.querySelector('img')).toBeNull()
    expect(screen.queryByTestId('spinner')).toBeNull()
    expect(screen.queryByTestId('typography')).toBeNull()
  })

  it('renders nothing in ready phase if container has no measurable size (box=null)', async () => {
    // For this test, report no size at all (for all observer calls during this render)
    resizeObserverImpl.mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
      (_args: any) => {
        /* no onResize call => width/height remain 0 */
      },
    )

    const { container } = render(
      <ResponsiveImage imageURL="https://cdn/nosize.jpg" alt="nosize" />,
    )
    await act(async () => {})

    // phase becomes ready internally, but box=null => no img content
    expect(container.querySelector('img')).toBeNull()
    // Also not loading or error
    expect(screen.queryByTestId('spinner')).toBeNull()
    expect(screen.queryByTestId('typography')).toBeNull()

    // reset mock for subsequent tests
    resizeObserverImpl.mockReset()
  })
})
