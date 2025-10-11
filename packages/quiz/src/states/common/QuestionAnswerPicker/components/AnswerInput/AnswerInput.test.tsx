import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import AnswerInput from './AnswerInput'

describe('AnswerInput', () => {
  it('renders interactive mode', () => {
    const { container } = render(<AnswerInput onSubmit={vi.fn()} />)
    expect(container).toMatchSnapshot()
  })

  it('submits current value when valid', () => {
    const onSubmit = vi.fn()
    render(<AnswerInput onSubmit={onSubmit} />)

    const input = screen.getByPlaceholderText('Answer') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Paris' } })

    const submit = screen.getByRole('button', { name: /submit/i })
    fireEvent.click(submit)

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith('Paris')
  })

  it('prevents default on form submit', () => {
    const onSubmit = vi.fn()
    const { container } = render(<AnswerInput onSubmit={onSubmit} />)

    const input = screen.getByPlaceholderText('Answer') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Rome' } })

    const form = container.querySelector('form')!
    const evt = new Event('submit', { bubbles: true, cancelable: true })
    const preventedBefore = evt.defaultPrevented
    form.dispatchEvent(evt)
    const preventedAfter = evt.defaultPrevented

    expect(preventedBefore).toBe(false)
    expect(preventedAfter).toBe(true)
    expect(onSubmit).toHaveBeenCalledWith('Rome')
  })

  it('renders non-interactive mode with info box and without form controls', () => {
    const { container } = render(
      <AnswerInput interactive={false} onSubmit={vi.fn()} />,
    )
    expect(
      screen.getByText(/Type an answer on your screen/i),
    ).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Answer')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /submit/i }),
    ).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
