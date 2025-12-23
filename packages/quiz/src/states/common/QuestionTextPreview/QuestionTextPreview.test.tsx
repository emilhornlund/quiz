import { act, render } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as deviceHook from '../../../utils/useDeviceSizeType.tsx'

import QuestionTextPreview from './QuestionTextPreview'

type ROInstance = { trigger: () => void }
const resizeObservers: ROInstance[] = []

class ResizeObserverMock {
  private cb: ResizeObserverCallback

  constructor(cb: ResizeObserverCallback) {
    this.cb = cb
    resizeObservers.push({
      trigger: () => this.cb([], this as unknown as ResizeObserver),
    })
  }

  observe() {
    // noop
  }

  unobserve() {
    // noop
  }

  disconnect() {
    // noop
  }
}

let rafCb: ((t: number) => void) | null = null

const installRafMock = () => {
  rafCb = null
  vi.stubGlobal('requestAnimationFrame', (cb: (t: number) => void) => {
    rafCb = cb
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', () => {})
}

const runRaf = async (t: number) => {
  if (!rafCb) {
    throw new Error('requestAnimationFrame callback not registered')
  }
  await act(async () => {
    rafCb?.(t)
  })
}

const forceOverflow = (
  viewport: HTMLElement,
  firstBlock: HTMLElement,
  viewportHeight: number,
  blockHeight: number,
) => {
  Object.defineProperty(viewport, 'clientHeight', {
    configurable: true,
    value: viewportHeight,
  })
  Object.defineProperty(firstBlock, 'offsetHeight', {
    configurable: true,
    value: blockHeight,
  })
}

describe('QuestionTextPreview', () => {
  beforeEach(() => {
    resizeObservers.length = 0
    vi.stubGlobal(
      'ResizeObserver',
      ResizeObserverMock as unknown as typeof ResizeObserver,
    )
    vi.stubGlobal('performance', { now: () => 0 } as unknown as Performance)
    installRafMock()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders the provided text', () => {
    vi.spyOn(deviceHook, 'useDeviceSizeType').mockReturnValue(
      deviceHook.DeviceType.Mobile,
    )

    const { getByText } = render(<QuestionTextPreview text="HELLO WORLD" />)
    expect(getByText('HELLO WORLD')).toBeInTheDocument()
  })

  it('uses mobile speed (70 px/s) and gap (64px) when device type is Mobile', async () => {
    vi.spyOn(deviceHook, 'useDeviceSizeType').mockReturnValue(
      deviceHook.DeviceType.Mobile,
    )

    const { container } = render(
      <QuestionTextPreview text="A very long piece of text that overflows" />,
    )

    const viewport = container.firstElementChild as HTMLElement
    const track = viewport.firstElementChild as HTMLElement
    const firstBlock = track.children[0] as HTMLElement

    forceOverflow(viewport, firstBlock, 100, 400)

    await act(async () => {
      resizeObservers.forEach((ro) => ro.trigger())
    })

    await runRaf(0)
    await runRaf(1000)

    expect(track.style.transform).toBe('translateY(-70px)')

    const gap = track.children[1] as HTMLElement
    expect(gap.style.height).toBe('64px')
  })

  it('uses tablet speed (95 px/s) and gap (96px) when device type is Tablet', async () => {
    vi.spyOn(deviceHook, 'useDeviceSizeType').mockReturnValue(
      deviceHook.DeviceType.Tablet,
    )

    const { container } = render(
      <QuestionTextPreview text="A very long piece of text that overflows" />,
    )

    const viewport = container.firstElementChild as HTMLElement
    const track = viewport.firstElementChild as HTMLElement
    const firstBlock = track.children[0] as HTMLElement

    forceOverflow(viewport, firstBlock, 100, 400)

    await act(async () => {
      resizeObservers.forEach((ro) => ro.trigger())
    })

    await runRaf(0)
    await runRaf(1000)

    expect(track.style.transform).toBe('translateY(-95px)')

    const gap = track.children[1] as HTMLElement
    expect(gap.style.height).toBe('96px')
  })

  it('uses desktop speed (110 px/s) and gap (128px) when device type is Desktop', async () => {
    vi.spyOn(deviceHook, 'useDeviceSizeType').mockReturnValue(
      deviceHook.DeviceType.Desktop,
    )

    const { container } = render(
      <QuestionTextPreview text="A very long piece of text that overflows" />,
    )

    const viewport = container.firstElementChild as HTMLElement
    const track = viewport.firstElementChild as HTMLElement
    const firstBlock = track.children[0] as HTMLElement

    forceOverflow(viewport, firstBlock, 100, 400)

    await act(async () => {
      resizeObservers.forEach((ro) => ro.trigger())
    })

    await runRaf(0)
    await runRaf(1000)

    expect(track.style.transform).toBe('translateY(-110px)')

    const gap = track.children[1] as HTMLElement
    expect(gap.style.height).toBe('128px')
  })

  it('falls back to default speed (95 px/s) and gap (96px) when device type is unknown', async () => {
    vi.spyOn(deviceHook, 'useDeviceSizeType').mockReturnValue(undefined)

    const { container } = render(
      <QuestionTextPreview text="A very long piece of text that overflows" />,
    )

    const viewport = container.firstElementChild as HTMLElement
    const track = viewport.firstElementChild as HTMLElement
    const firstBlock = track.children[0] as HTMLElement

    forceOverflow(viewport, firstBlock, 100, 400)

    await act(async () => {
      resizeObservers.forEach((ro) => ro.trigger())
    })

    await runRaf(0)
    await runRaf(1000)

    expect(track.style.transform).toBe('translateY(-95px)')

    const gap = track.children[1] as HTMLElement
    expect(gap.style.height).toBe('96px')
  })
})
