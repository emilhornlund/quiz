import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import AnswerPicker from './AnswerPicker'

describe('AnswerPicker', () => {
  it('renders with answers in interactive mode', () => {
    const { container } = render(
      <AnswerPicker
        answers={['Alpha', 'Beta', 'Gamma', 'Delta']}
        interactive
        onClick={vi.fn()}
      />,
    )
    expect(screen.getAllByRole('button')).toHaveLength(4)
    expect(container).toMatchSnapshot()
  })

  it('calls onClick with the selected index', () => {
    const onClick = vi.fn()
    render(
      <AnswerPicker
        answers={['Red', 'Green', 'Blue']}
        interactive
        onClick={onClick}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Green' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledWith(1)
  })

  it('sets stable ids on buttons', () => {
    render(
      <AnswerPicker
        answers={['Paris', 'Berlin', 'Rome']}
        interactive
        onClick={vi.fn()}
      />,
    )

    expect(document.getElementById('0_Paris')).toBeInTheDocument()
    expect(document.getElementById('1_Berlin')).toBeInTheDocument()
    expect(document.getElementById('2_Rome')).toBeInTheDocument()
  })

  it('disables buttons when not interactive and does not fire onClick', () => {
    const onClick = vi.fn()
    render(
      <AnswerPicker
        answers={['One', 'Two']}
        interactive={false}
        onClick={onClick}
      />,
    )

    const [one, two] = screen.getAllByRole('button')
    expect(one).toBeDisabled()
    expect(two).toBeDisabled()

    fireEvent.click(one)
    fireEvent.click(two)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders nothing inside grid when answers is empty', () => {
    const { container } = render(
      <AnswerPicker answers={[]} interactive onClick={vi.fn()} />,
    )
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(container).toMatchSnapshot()
  })
})
