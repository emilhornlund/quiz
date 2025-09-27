import { faMaximize, faMinimize } from '@fortawesome/free-solid-svg-icons'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DeviceType } from '../../../utils/useDeviceSizeType'

const h = vi.hoisted(() => {
  return {
    state: {
      isFullscreenActive: false as boolean,
      deviceType: 'Desktop' as 'Mobile' | 'Tablet' | 'Desktop',
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    toggleFullscreen: vi.fn<[], Promise<void>>().mockResolvedValue(undefined),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PageMock: vi.fn(({ header, hideLogin, children }: any) => (
      <div data-testid="page" data-hide-login={hideLogin ? 'true' : 'false'}>
        <div data-testid="header">{header}</div>
        <div data-testid="content">{children}</div>
      </div>
    )),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ButtonMock: vi.fn((props: any) => (
      <button {...props}>{props.children}</button>
    )),
  }
})

vi.mock('../../../context/game', () => ({
  useGameContext: () => ({
    get isFullscreenActive() {
      return h.state.isFullscreenActive
    },
    toggleFullscreen: h.toggleFullscreen,
  }),
}))

vi.mock('../../../utils/useDeviceSizeType', () => ({
  DeviceType: {
    Mobile: 'Mobile',
    Tablet: 'Tablet',
    Desktop: 'Desktop',
  } as const,
  useDeviceSizeType: () => h.state.deviceType,
}))

vi.mock('../../../components', () => ({
  Page: h.PageMock,
  Button: h.ButtonMock,
}))

import GamePage from './GamePage'

describe('GamePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    h.state.isFullscreenActive = false
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    h.state.deviceType = DeviceType.Desktop
  })

  it('renders Page with header and children and sets hideLogin', () => {
    const { container } = render(
      <GamePage header={<div data-testid="custom-header">H</div>}>
        <div data-testid="slot">Body</div>
      </GamePage>,
    )

    expect(screen.getByTestId('page')).toBeInTheDocument()
    expect(screen.getByTestId('page')).toHaveAttribute(
      'data-hide-login',
      'true',
    )
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('custom-header')).toBeInTheDocument()
    expect(screen.getByTestId('content')).toHaveTextContent('Body')

    expect(container).toMatchSnapshot()
  })

  it('shows fullscreen button on non-mobile devices with maximize icon initially', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    h.state.deviceType = DeviceType.Desktop
    const { container } = render(
      <GamePage header={<span>Header</span>}>
        <div>Body</div>
      </GamePage>,
    )

    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('id', 'fullscreen-button')

    // Inspect props passed to mocked Button
    const call = h.ButtonMock.mock.calls.find(
      (c) => c[0]?.id === 'fullscreen-button',
    )
    expect(call?.[0].icon).toBe(faMaximize)

    expect(container).toMatchSnapshot()
  })

  it('hides fullscreen button on mobile', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    h.state.deviceType = DeviceType.Mobile
    const { container } = render(
      <GamePage header={<span>Header</span>}>
        <div>Body</div>
      </GamePage>,
    )
    expect(screen.queryByRole('button')).toBeNull()

    expect(container).toMatchSnapshot()
  })

  it('uses minimize icon when fullscreen is active', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    h.state.deviceType = DeviceType.Desktop
    h.state.isFullscreenActive = true
    const { container } = render(
      <GamePage header={<span>Header</span>}>
        <div>Body</div>
      </GamePage>,
    )

    const call = h.ButtonMock.mock.calls.find(
      (c) => c[0]?.id === 'fullscreen-button',
    )
    expect(call?.[0].icon).toBe(faMinimize)

    expect(container).toMatchSnapshot()
  })

  it('calls toggleFullscreen on click', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    h.state.deviceType = DeviceType.Desktop
    const { container } = render(
      <GamePage header={<span>Header</span>}>
        <div>Body</div>
      </GamePage>,
    )

    fireEvent.click(screen.getByRole('button'))
    expect(h.toggleFullscreen).toHaveBeenCalledTimes(1)

    expect(container).toMatchSnapshot()
  })
})
