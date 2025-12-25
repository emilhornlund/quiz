import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import HostGameFooter from './HostGameFooter'

vi.mock('./HostGameFooter.module.scss', () => ({
  default: {
    main: 'main',
    questions: 'questions',
    gamePIN: 'gamePIN',
    actions: 'actions',
    menuButtonWrapper: 'menuButtonWrapper',
  },
}))

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: { icon: unknown }) => (
    <span data-testid="fa-icon">{String(!!props.icon)}</span>
  ),
}))

const toggleFullscreenMock = vi.fn()
const useGameContextMock = vi.fn()

vi.mock('../../../context/game', () => ({
  useGameContext: () => useGameContextMock(),
}))

const buttonMock = vi.fn(
  ({
    id,
    onClick,
  }: {
    id?: string
    onClick?: () => void
    type?: string
    kind?: string
    icon?: unknown
  }) => (
    <button type="button" id={id} onClick={onClick}>
      Button
    </button>
  ),
)

const menuMock = vi.fn(
  ({
    isOpen,
    children,
    onClose,
  }: {
    anchorRef: React.RefObject<HTMLElement | null>
    position: 'above' | 'below'
    align: 'start' | 'end'
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
  }) => (
    <div data-testid="menu">
      <div data-testid="menu-open">{String(isOpen)}</div>
      <button type="button" data-testid="menu-close" onClick={onClose}>
        close
      </button>
      {isOpen ? <div data-testid="menu-content">{children}</div> : null}
    </div>
  ),
)

const menuItemMock = vi.fn(
  ({
    children,
    onClick,
    disabled,
  }: {
    icon?: unknown
    disabled?: boolean
    onClick?: () => void
    children: React.ReactNode
  }) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
)

const menuSeparatorMock = vi.fn(() => <div data-testid="menu-separator" />)

vi.mock('../../../components', () => ({
  Button: (props: any) => buttonMock(props),
  Menu: (props: any) => menuMock(props),
  MenuItem: (props: any) => menuItemMock(props),
  MenuSeparator: () => menuSeparatorMock(),
}))

describe('HostGameFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    toggleFullscreenMock.mockReset()
    useGameContextMock.mockReset()
    useGameContextMock.mockReturnValue({
      isFullscreenActive: false,
      toggleFullscreen: toggleFullscreenMock,
    })
  })

  it('renders current question and total questions', () => {
    render(
      <HostGameFooter
        gamePIN="123456"
        currentQuestion={3}
        totalQuestions={10}
      />,
    )

    expect(screen.getByText('3 / 10')).toBeInTheDocument()
  })

  it('renders game PIN', () => {
    render(
      <HostGameFooter
        gamePIN="654321"
        currentQuestion={1}
        totalQuestions={5}
      />,
    )

    expect(screen.getByText('654321')).toBeInTheDocument()
  })

  it('renders settings button with expected id', () => {
    render(
      <HostGameFooter
        gamePIN="111111"
        currentQuestion={1}
        totalQuestions={1}
      />,
    )

    expect(screen.getByRole('button', { name: 'Button' })).toHaveAttribute(
      'id',
      'settings-button',
    )
  })

  it('initially renders Menu with isOpen=false', () => {
    render(
      <HostGameFooter
        gamePIN="123456"
        currentQuestion={1}
        totalQuestions={1}
      />,
    )

    expect(screen.getByTestId('menu-open')).toHaveTextContent('false')
    expect(screen.queryByTestId('menu-content')).not.toBeInTheDocument()
  })

  it('opens the settings menu when clicking the settings button', () => {
    render(
      <HostGameFooter
        gamePIN="123456"
        currentQuestion={1}
        totalQuestions={1}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Button' }))

    expect(screen.getByTestId('menu-open')).toHaveTextContent('true')
    expect(screen.getByTestId('menu-content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Players' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Maximize' })).toBeEnabled()
    expect(screen.getByTestId('menu-separator')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quit' })).toBeDisabled()
  })

  it('closes the settings menu when clicking the settings button again', () => {
    render(
      <HostGameFooter
        gamePIN="123456"
        currentQuestion={1}
        totalQuestions={1}
      />,
    )

    const settingsButton = screen.getByRole('button', { name: 'Button' })

    fireEvent.click(settingsButton)
    expect(screen.getByTestId('menu-open')).toHaveTextContent('true')

    fireEvent.click(settingsButton)
    expect(screen.getByTestId('menu-open')).toHaveTextContent('false')
  })

  it('closes the menu via Menu onClose (simulating click outside)', () => {
    render(
      <HostGameFooter
        gamePIN="123456"
        currentQuestion={1}
        totalQuestions={1}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Button' }))
    expect(screen.getByTestId('menu-open')).toHaveTextContent('true')

    fireEvent.click(screen.getByTestId('menu-close'))
    expect(screen.getByTestId('menu-open')).toHaveTextContent('false')
  })

  it('calls toggleFullscreen and keeps menu state unchanged when clicking fullscreen item', () => {
    render(
      <HostGameFooter
        gamePIN="123456"
        currentQuestion={1}
        totalQuestions={1}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Button' }))
    expect(screen.getByTestId('menu-open')).toHaveTextContent('true')

    fireEvent.click(screen.getByRole('button', { name: 'Maximize' }))

    expect(toggleFullscreenMock).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('menu-open')).toHaveTextContent('true')
  })

  it('renders Minimize and uses minimize icon when fullscreen is active', () => {
    useGameContextMock.mockReturnValue({
      isFullscreenActive: true,
      toggleFullscreen: toggleFullscreenMock,
    })

    render(
      <HostGameFooter
        gamePIN="123456"
        currentQuestion={1}
        totalQuestions={1}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Button' }))

    expect(screen.getByRole('button', { name: 'Minimize' })).toBeEnabled()
    expect(
      screen.queryByRole('button', { name: 'Maximize' }),
    ).not.toBeInTheDocument()
  })

  it('wires Menu props: position="above" and align="end"', () => {
    render(
      <HostGameFooter
        gamePIN="123456"
        currentQuestion={1}
        totalQuestions={1}
      />,
    )

    expect(menuMock).toHaveBeenCalled()
    const call = menuMock.mock.calls[0][0]

    expect(call.position).toBe('above')
    expect(call.align).toBe('end')
  })

  it('passes an anchorRef to Menu (settingsMenuButtonRef)', () => {
    render(
      <HostGameFooter
        gamePIN="123456"
        currentQuestion={1}
        totalQuestions={1}
      />,
    )

    const call = menuMock.mock.calls[0][0]
    expect(call.anchorRef).toBeTruthy()
    expect(typeof call.anchorRef).toBe('object')
    expect('current' in call.anchorRef).toBe(true)
  })

  it('Players and Quit items are disabled and do not invoke handlers when clicked', () => {
    render(
      <HostGameFooter
        gamePIN="123456"
        currentQuestion={1}
        totalQuestions={1}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Button' }))

    const players = screen.getByRole('button', { name: 'Players' })
    const quit = screen.getByRole('button', { name: 'Quit' })

    expect(players).toBeDisabled()
    expect(quit).toBeDisabled()

    fireEvent.click(players)
    fireEvent.click(quit)

    expect(toggleFullscreenMock).toHaveBeenCalledTimes(0)
  })

  it('renders the expected menu item order: Players, Maximize/Minimize, separator, Quit', () => {
    render(
      <HostGameFooter
        gamePIN="123456"
        currentQuestion={1}
        totalQuestions={1}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Button' }))

    const menuContent = screen.getByTestId('menu-content')
    const items = Array.from(menuContent.querySelectorAll('button')).map(
      (b) => b.textContent,
    )

    expect(items).toEqual(['Players', 'Maximize', 'Quit'])
    expect(screen.getByTestId('menu-separator')).toBeInTheDocument()
  })
})
