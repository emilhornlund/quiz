import {
  QUIZ_TYPE_ANSWER_OPTIONS_MAX,
  QUIZ_TYPE_ANSWER_OPTIONS_MIN,
} from '@quiz/common'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ValidationResult } from '../../../../../../../../validation'

import TypeAnswerOptions from './TypeAnswerOptions'

type AnyValidation = ValidationResult<Record<string, unknown>>

function makeValidation(
  errors: Array<{ path: string; message: string }> = [],
): AnyValidation {
  return {
    valid: errors.length === 0,
    errors: errors.map((e) => ({
      path: e.path,
      message: e.message,
    })),
  } as unknown as AnyValidation
}

function lastCallArg<T>(
  mock: { calls: unknown[][] },
  argIndex = 0,
): T | undefined {
  const calls = mock.calls
  if (!calls.length) return undefined
  return calls[calls.length - 1][argIndex] as T
}

function optionInput(index: number): HTMLElement {
  return screen.getByPlaceholderText(`Option ${index + 1}`)
}

describe('TypeAnswerOptions', () => {
  it('renders QUIZ_TYPE_ANSWER_OPTIONS_MAX option fields', () => {
    const onChange = vi.fn()
    render(
      <TypeAnswerOptions
        onChange={onChange}
        validation={makeValidation()}
        values={[]}
      />,
    )

    const inputs = Array.from(
      { length: QUIZ_TYPE_ANSWER_OPTIONS_MAX },
      (_, i) => optionInput(i),
    )

    expect(inputs).toHaveLength(QUIZ_TYPE_ANSWER_OPTIONS_MAX)
  })

  it('initializes inputs from values and updates when values changes', () => {
    const onChange = vi.fn()

    const { rerender } = render(
      <TypeAnswerOptions
        onChange={onChange}
        validation={makeValidation()}
        values={['One', 'Two']}
      />,
    )

    expect(optionInput(0)).toHaveValue('One')
    expect(optionInput(1)).toHaveValue('Two')
    expect(optionInput(2)).toHaveValue('')
    expect(optionInput(3)).toHaveValue('')

    rerender(
      <TypeAnswerOptions
        onChange={onChange}
        validation={makeValidation()}
        values={['A', 'B', 'C', 'D']}
      />,
    )

    expect(optionInput(0)).toHaveValue('A')
    expect(optionInput(1)).toHaveValue('B')
    expect(optionInput(2)).toHaveValue('C')
    expect(optionInput(3)).toHaveValue('D')
  })

  it('emits trimmed slice enforcing QUIZ_TYPE_ANSWER_OPTIONS_MIN', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <TypeAnswerOptions
        onChange={onChange}
        validation={makeValidation()}
        values={[]}
      />,
    )

    await user.type(optionInput(0), 'Alpha')

    const emitted1 = lastCallArg<string[]>(onChange.mock)
    expect(emitted1).toBeDefined()
    expect(emitted1!.length).toBeGreaterThanOrEqual(
      QUIZ_TYPE_ANSWER_OPTIONS_MIN,
    )
    expect(emitted1![0]).toBe('Alpha')

    await user.clear(optionInput(0))

    const emitted2 = lastCallArg<string[]>(onChange.mock)
    expect(emitted2).toBeDefined()
    expect(emitted2!.length).toBe(QUIZ_TYPE_ANSWER_OPTIONS_MIN)
  })

  it('trims to last non-empty while enforcing minimum (fill option 4 => length 4, clear => min)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <TypeAnswerOptions
        onChange={onChange}
        validation={makeValidation()}
        values={[]}
      />,
    )

    await user.type(optionInput(3), 'Delta')

    const emitted1 = lastCallArg<string[]>(onChange.mock)
    expect(emitted1).toBeDefined()
    expect(emitted1!.length).toBe(4)
    expect(emitted1![3]).toBe('Delta')

    await user.clear(optionInput(3))

    const emitted2 = lastCallArg<string[]>(onChange.mock)
    expect(emitted2).toBeDefined()
    expect(emitted2!.length).toBe(QUIZ_TYPE_ANSWER_OPTIONS_MIN)
  })

  it('shows options error message for every input when path is "options"', () => {
    const onChange = vi.fn()

    render(
      <TypeAnswerOptions
        onChange={onChange}
        validation={makeValidation([
          { path: 'options', message: 'Options error' },
        ])}
        values={[]}
      />,
    )

    const all = screen.getAllByText('Options error')
    expect(all).toHaveLength(QUIZ_TYPE_ANSWER_OPTIONS_MAX)
  })

  it('prefers options[index] error over options (index-specific overrides global)', () => {
    const onChange = vi.fn()

    render(
      <TypeAnswerOptions
        onChange={onChange}
        validation={makeValidation([
          { path: 'options', message: 'Options error' },
          { path: 'options[2]', message: 'Option 3 is invalid' },
        ])}
        values={[]}
      />,
    )

    expect(screen.getByText('Option 3 is invalid')).toBeInTheDocument()

    const global = screen.getAllByText('Options error')
    expect(global).toHaveLength(QUIZ_TYPE_ANSWER_OPTIONS_MAX - 1)
  })
})
