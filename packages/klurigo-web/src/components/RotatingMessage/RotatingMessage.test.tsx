import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import RotatingMessage from './RotatingMessage'

let lastArgs:
  | {
      messages: string[]
      options: unknown
    }
  | undefined

const h = vi.hoisted(() => ({
  message: '' as string,
  animation: 'visible' as 'visible' | 'entering' | 'exiting',
}))

vi.mock('./useRotatingMessage', () => ({
  useRotatingMessage: (messages: string[], options?: unknown) => {
    lastArgs = { messages, options }
    return { message: h.message, animation: h.animation }
  },
}))

vi.mock('../../utils/helpers', () => ({
  classNames: (...classes: Array<string | undefined | false | null>) =>
    classes.filter(Boolean).join(' '),
}))

vi.mock('./RotatingMessage.module.scss', () => ({
  default: {
    messageContainer: 'messageContainer',
    message: 'message',
    visible: 'visible',
    entering: 'entering',
    exiting: 'exiting',
  },
}))

describe('RotatingMessage', () => {
  afterEach(() => {
    h.message = ''
    h.animation = 'visible'
    lastArgs = undefined
  })

  it('renders nothing when message is empty', () => {
    h.message = ''

    const { container } = render(<RotatingMessage messages={['a', 'b']} />)

    expect(container.firstChild).toBeNull()
    expect(container).toMatchSnapshot()
  })

  it('renders message as plain text when renderMessage is not provided', () => {
    h.message = 'Hello world'
    h.animation = 'visible'

    const { container } = render(<RotatingMessage messages={['a', 'b']} />)

    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders message using renderMessage when provided', () => {
    h.message = 'Hello world'
    h.animation = 'visible'

    const { container } = render(
      <RotatingMessage
        messages={['a', 'b']}
        renderMessage={(msg) => <span data-testid="custom">{msg}</span>}
      />,
    )

    expect(screen.getByTestId('custom')).toHaveTextContent('Hello world')
    expect(container).toMatchSnapshot()
  })

  it('applies container className and messageClassName', () => {
    h.message = 'Hello'
    h.animation = 'visible'

    const { container } = render(
      <RotatingMessage
        messages={['a', 'b']}
        className="outer"
        messageClassName="inner"
      />,
    )

    const outer = container.querySelector('.messageContainer')
    const inner = container.querySelector('.message')

    expect(outer).toBeInTheDocument()
    expect(outer).toHaveClass('outer')

    expect(inner).toBeInTheDocument()
    expect(inner).toHaveClass('inner')

    expect(container).toMatchSnapshot()
  })

  it('applies the animation stage class', () => {
    h.message = 'Hello'
    h.animation = 'entering'

    const { container } = render(<RotatingMessage messages={['a', 'b']} />)

    const inner = container.querySelector('.message')
    expect(inner).toBeInTheDocument()
    expect(inner).toHaveClass('entering')

    expect(container).toMatchSnapshot()
  })

  it('passes messages and options to useRotatingMessage', () => {
    h.message = 'Hello'
    h.animation = 'visible'

    render(
      <RotatingMessage
        messages={['a', 'b']}
        options={{ rotateEveryMs: 1234 }}
      />,
    )

    expect(lastArgs).toEqual({
      messages: ['a', 'b'],
      options: { rotateEveryMs: 1234 },
    })
  })
})
