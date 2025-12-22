import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ValidationResult } from '../../../../../../../../validation'

import TrueFalseOptions from './TrueFalseOptions'

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

function optionTextFieldInput(index: number): HTMLInputElement {
  return screen.getByDisplayValue(
    index === 0 ? 'True' : 'False',
  ) as HTMLInputElement
}

/**
 * Attempts to locate the check control rendered by TextField for the given option index.
 *
 * We intentionally avoid depending on your TextField internals; this tries common patterns:
 * - input[type="checkbox"] inside the option container
 * - an element with role="checkbox" inside the option container
 */
function getCheckboxForOption(index: number): HTMLElement {
  const input = optionTextFieldInput(index)
  const optionContainer =
    input.closest('[class*="option"]') ?? input.parentElement
  if (!optionContainer) throw new Error('Could not locate option container')

  const checkboxInput = optionContainer.querySelector('input[type="checkbox"]')
  if (checkboxInput) return checkboxInput as HTMLElement

  const roleCheckbox = optionContainer.querySelector('[role="checkbox"]')
  if (roleCheckbox) return roleCheckbox as HTMLElement

  throw new Error(
    'Could not find checkbox control (input[type=checkbox] or [role=checkbox]) for True/False option',
  )
}

describe('TrueFalseOptions', () => {
  it('renders two options with labels True and False', () => {
    const onChange = vi.fn()

    render(
      <TrueFalseOptions
        onChange={onChange}
        validation={makeValidation()}
        value={undefined}
      />,
    )

    expect(screen.getByDisplayValue('True')).toBeInTheDocument()
    expect(screen.getByDisplayValue('False')).toBeInTheDocument()
  })

  it('initially has no selection when value is undefined', () => {
    const onChange = vi.fn()

    render(
      <TrueFalseOptions
        onChange={onChange}
        validation={makeValidation()}
        value={undefined}
      />,
    )

    const trueCheck = getCheckboxForOption(0)
    const falseCheck = getCheckboxForOption(1)

    if (trueCheck instanceof HTMLInputElement) {
      expect(trueCheck.checked).toBe(false)
    } else {
      expect(trueCheck).toHaveAttribute('aria-checked', 'false')
    }

    if (falseCheck instanceof HTMLInputElement) {
      expect(falseCheck.checked).toBe(false)
    } else {
      expect(falseCheck).toHaveAttribute('aria-checked', 'false')
    }
  })

  it('selecting True emits onChange(true)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <TrueFalseOptions
        onChange={onChange}
        validation={makeValidation()}
        value={undefined}
      />,
    )

    await user.click(getCheckboxForOption(0))

    const last = lastCallArg<boolean | undefined>(onChange.mock)
    expect(last).toBe(true)
  })

  it('selecting False after True emits onChange(false) and unselects True', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <TrueFalseOptions
        onChange={onChange}
        validation={makeValidation()}
        value={undefined}
      />,
    )

    await user.click(getCheckboxForOption(0))
    await user.click(getCheckboxForOption(1))

    const last = lastCallArg<boolean | undefined>(onChange.mock)
    expect(last).toBe(false)

    const trueCheck = getCheckboxForOption(0)
    const falseCheck = getCheckboxForOption(1)

    if (trueCheck instanceof HTMLInputElement) {
      expect(trueCheck.checked).toBe(false)
    } else {
      expect(trueCheck).toHaveAttribute('aria-checked', 'false')
    }

    if (falseCheck instanceof HTMLInputElement) {
      expect(falseCheck.checked).toBe(true)
    } else {
      expect(falseCheck).toHaveAttribute('aria-checked', 'true')
    }
  })

  it('unchecking the active selection emits onChange(undefined)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <TrueFalseOptions
        onChange={onChange}
        validation={makeValidation()}
        value={undefined}
      />,
    )

    await user.click(getCheckboxForOption(0))
    await user.click(getCheckboxForOption(0))

    const last = lastCallArg<boolean | undefined>(onChange.mock)
    expect(last).toBeUndefined()
  })

  it('reflects external value changes (rerender): value=true selects True, value=false selects False', () => {
    const onChange = vi.fn()

    const { rerender } = render(
      <TrueFalseOptions
        onChange={onChange}
        validation={makeValidation()}
        value={undefined}
      />,
    )

    rerender(
      <TrueFalseOptions
        onChange={onChange}
        validation={makeValidation()}
        value={true}
      />,
    )

    {
      const trueCheck = getCheckboxForOption(0)
      const falseCheck = getCheckboxForOption(1)

      if (trueCheck instanceof HTMLInputElement) {
        expect(trueCheck.checked).toBe(true)
      } else {
        expect(trueCheck).toHaveAttribute('aria-checked', 'true')
      }

      if (falseCheck instanceof HTMLInputElement) {
        expect(falseCheck.checked).toBe(false)
      } else {
        expect(falseCheck).toHaveAttribute('aria-checked', 'false')
      }
    }

    rerender(
      <TrueFalseOptions
        onChange={onChange}
        validation={makeValidation()}
        value={false}
      />,
    )

    {
      const trueCheck = getCheckboxForOption(0)
      const falseCheck = getCheckboxForOption(1)

      if (trueCheck instanceof HTMLInputElement) {
        expect(trueCheck.checked).toBe(false)
      } else {
        expect(trueCheck).toHaveAttribute('aria-checked', 'false')
      }

      if (falseCheck instanceof HTMLInputElement) {
        expect(falseCheck.checked).toBe(true)
      } else {
        expect(falseCheck).toHaveAttribute('aria-checked', 'true')
      }
    }
  })

  it('shows "correct" validation error on both fields when validation has path "correct"', () => {
    const onChange = vi.fn()

    render(
      <TrueFalseOptions
        onChange={onChange}
        validation={makeValidation([
          { path: 'correct', message: 'Correct is required' },
        ])}
        value={undefined}
      />,
    )

    const all = screen.getAllByText('Correct is required')
    expect(all).toHaveLength(2)
  })

  it('shows additional validation message when nothing selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <TrueFalseOptions
        onChange={onChange}
        validation={makeValidation()}
        value={undefined}
      />,
    )

    await user.click(getCheckboxForOption(0))
    await user.click(getCheckboxForOption(0))

    expect(
      screen.getAllByText('At least one option must be marked correct').length,
    ).toBeGreaterThan(0)
  })
})
