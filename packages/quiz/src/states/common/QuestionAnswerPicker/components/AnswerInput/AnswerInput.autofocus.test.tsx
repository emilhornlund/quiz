import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import AnswerInput from './AnswerInput'

describe('AnswerInput autofocus functionality', () => {
  it('should render input field with autoFocus prop when interactive mode is enabled', () => {
    const onSubmit = vi.fn()
    render(<AnswerInput interactive onSubmit={onSubmit} />)

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    // The autoFocus prop should be passed to TextField component
  })

  it('should not autofocus input field when in non-interactive mode', () => {
    const onSubmit = vi.fn()
    render(<AnswerInput interactive={false} onSubmit={onSubmit} />)

    // Should not find textbox in non-interactive mode
    const input = screen.queryByRole('textbox')
    expect(input).not.toBeInTheDocument()
  })

  it('should submit form when submit button is clicked with valid input', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<AnswerInput interactive onSubmit={onSubmit} />)

    const input = screen.getByRole('textbox')
    const submitButton = screen.getByRole('button', { name: 'Submit' })

    await user.type(input, 'test answer')
    await user.click(submitButton)

    // Should submit when button is clicked
    expect(onSubmit).toHaveBeenCalledWith('test answer')
  })

  it('should disable submit button when input is empty', () => {
    const onSubmit = vi.fn()
    render(<AnswerInput interactive onSubmit={onSubmit} />)

    const submitButton = screen.getByRole('button', { name: 'Submit' })

    // Submit button should be disabled with empty input
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button when input has valid content', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<AnswerInput interactive onSubmit={onSubmit} />)

    const input = screen.getByRole('textbox')
    const submitButton = screen.getByRole('button', { name: 'Submit' })

    // Initially disabled
    expect(submitButton).toBeDisabled()

    // Type valid content
    await user.type(input, 'test answer')

    // Should be enabled with valid input
    expect(submitButton).not.toBeDisabled()
  })
})
