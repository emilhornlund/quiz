import { QUIZ_PUZZLE_VALUES_MAX, QUIZ_PUZZLE_VALUES_MIN } from '@klurigo/common'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { ValidationResult } from '../../../../../../../../validation'

import PuzzleValues from './PuzzleValues'

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

function valueInput(index: number): HTMLElement {
  return screen.getByPlaceholderText(`Value ${index + 1}`)
}

describe('PuzzleValues', () => {
  it('renders QUIZ_PUZZLE_VALUES_MAX inputs with correct placeholders', () => {
    const onChange = vi.fn()

    render(
      <PuzzleValues
        onChange={onChange}
        validation={makeValidation()}
        value={[]}
      />,
    )

    const inputs = Array.from({ length: QUIZ_PUZZLE_VALUES_MAX }, (_, i) =>
      valueInput(i),
    )
    expect(inputs).toHaveLength(QUIZ_PUZZLE_VALUES_MAX)
  })

  it('initializes from value prop and updates when value changes', () => {
    const onChange = vi.fn()

    const { rerender } = render(
      <PuzzleValues
        onChange={onChange}
        validation={makeValidation()}
        value={['A', 'B']}
      />,
    )

    expect(valueInput(0)).toHaveValue('A')
    expect(valueInput(1)).toHaveValue('B')
    expect(valueInput(2)).toHaveValue('')
    expect(valueInput(3)).toHaveValue('')

    rerender(
      <PuzzleValues
        onChange={onChange}
        validation={makeValidation()}
        value={['AA', 'BB', 'CC', 'DD']}
      />,
    )

    expect(valueInput(0)).toHaveValue('AA')
    expect(valueInput(1)).toHaveValue('BB')
    expect(valueInput(2)).toHaveValue('CC')
    expect(valueInput(3)).toHaveValue('DD')
  })

  it('emits trimmed slice honoring QUIZ_PUZZLE_VALUES_MIN when editing early fields', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <PuzzleValues
        onChange={onChange}
        validation={makeValidation()}
        value={[]}
      />,
    )

    await user.type(valueInput(0), 'Alpha')
    await user.type(valueInput(1), 'Beta')

    const emitted = lastCallArg<string[]>(onChange.mock)
    expect(emitted).toBeDefined()
    expect(emitted!.length).toBeGreaterThanOrEqual(QUIZ_PUZZLE_VALUES_MIN)
    expect(emitted![0]).toBe('Alpha')
    expect(emitted![1]).toBe('Beta')
  })

  it('trims to last non-empty index while enforcing minimum (fill index 4 => length >= 5, clear => min)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <PuzzleValues
        onChange={onChange}
        validation={makeValidation()}
        value={[]}
      />,
    )

    // Value 5 (index 4) is filled => cutoff should become at least 5
    await user.type(valueInput(4), 'Echo')

    const emitted1 = lastCallArg<string[]>(onChange.mock)
    expect(emitted1).toBeDefined()
    expect(emitted1!.length).toBeGreaterThanOrEqual(5)
    expect(emitted1![4]).toBe('Echo')

    // Clear it => should fall back to QUIZ_PUZZLE_VALUES_MIN
    await user.clear(valueInput(4))

    const emitted2 = lastCallArg<string[]>(onChange.mock)
    expect(emitted2).toBeDefined()
    expect(emitted2!.length).toBe(QUIZ_PUZZLE_VALUES_MIN)
  })

  it('keeps minimum slice even when all values are empty', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <PuzzleValues
        onChange={onChange}
        validation={makeValidation()}
        value={[]}
      />,
    )

    // Trigger a change (type then clear) to ensure onChange is called
    await user.type(valueInput(0), 'X')
    await user.clear(valueInput(0))

    const emitted = lastCallArg<string[]>(onChange.mock)
    expect(emitted).toBeDefined()
    expect(emitted!.length).toBe(QUIZ_PUZZLE_VALUES_MIN)
    expect(emitted![0]).toBe('')
  })

  it('shows values[index] validation error only for that field, ignoring global values error for that index', () => {
    const onChange = vi.fn()

    render(
      <PuzzleValues
        onChange={onChange}
        validation={makeValidation([
          { path: 'values', message: 'Global values error' },
          { path: 'values[2]', message: 'Value 3 is invalid' },
        ])}
        value={[]}
      />,
    )

    // index-specific should appear
    expect(screen.getByText('Value 3 is invalid')).toBeInTheDocument()

    // global error should still appear for the other fields (max - 1 times)
    const global = screen.getAllByText('Global values error')
    expect(global).toHaveLength(QUIZ_PUZZLE_VALUES_MAX - 1)
  })

  it('shows global values validation error for every field when only "values" error is present', () => {
    const onChange = vi.fn()

    render(
      <PuzzleValues
        onChange={onChange}
        validation={makeValidation([
          { path: 'values', message: 'Values error' },
        ])}
        value={[]}
      />,
    )

    const all = screen.getAllByText('Values error')
    expect(all).toHaveLength(QUIZ_PUZZLE_VALUES_MAX)
  })
})
