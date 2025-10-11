import {
  QUIZ_PUZZLE_VALUE_REGEX,
  QUIZ_PUZZLE_VALUES_MAX,
  QUIZ_PUZZLE_VALUES_MIN,
} from '@quiz/common'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import PuzzleValues from './PuzzleValues'

vi.mock('../../../../../../../../components', () => {
  return {
    TextField: (props: {
      id: string
      value: string
      placeholder?: string
      regex?: RegExp
      required?: boolean
      forceValidate?: boolean
      onChange?: (v: string) => void
      onValid?: (ok: boolean) => void
      type?: string
    }) => {
      const { id, value, placeholder, regex, required, onChange, onValid } =
        props

      const runValidation = (val: string) => {
        if (!onValid) return
        const hasValue = val.length > 0
        let ok = true
        if (required) {
          ok = ok && hasValue
          if (hasValue && regex) ok = ok && regex.test(val)
        } else {
          if (hasValue && regex) ok = ok && regex.test(val)
        }
        onValid(ok)
      }

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value
        onChange?.(next)
        runValidation(next)
      }

      React.useEffect(() => {
        runValidation(value)
      }, [value, required, regex])

      return (
        <input
          data-testid={`input-${id}`}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
        />
      )
    },
  }
})

function lastCallArg<T>(
  mock: { calls: unknown[][] },
  argIndex = 0,
): T | undefined {
  const calls = mock.calls
  if (!calls.length) return undefined

  return calls[calls.length - 1][argIndex] as T
}

describe('PuzzleValues', () => {
  const user = userEvent.setup()
  let mathSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    mathSpy = vi.spyOn(Math, 'random').mockReturnValue(0.123456)
  })

  afterEach(() => {
    mathSpy.mockRestore()
    vi.clearAllMocks()
  })

  it('renders and matches snapshot', () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    const { container } = render(
      <PuzzleValues onChange={onChange} onValid={onValid} />,
    )
    expect(container).toMatchSnapshot()
  })

  it('initializes up to max inputs and respects placeholders', () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    render(<PuzzleValues onChange={onChange} onValid={onValid} />)
    const inputs = Array.from({ length: QUIZ_PUZZLE_VALUES_MAX }, (_, i) =>
      screen.getByPlaceholderText(`Value ${i + 1}`),
    )
    expect(inputs.length).toBe(QUIZ_PUZZLE_VALUES_MAX)
  })

  it('updates values and emits trimmed slice honoring minimum', async () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    render(<PuzzleValues onChange={onChange} onValid={onValid} />)

    const first = screen.getByPlaceholderText('Value 1')
    const second = screen.getByPlaceholderText('Value 2')

    await user.clear(first)
    await user.type(first, 'Alpha')
    await user.clear(second)
    await user.type(second, 'Beta')

    const emitted = lastCallArg<string[]>(onChange.mock)
    expect(emitted).toBeDefined()
    expect(emitted!.length).toBeGreaterThanOrEqual(QUIZ_PUZZLE_VALUES_MIN)
    expect(emitted![0]).toBe('Alpha')
    expect(emitted![1]).toBe('Beta')
  })

  it('trims to last non-empty index while enforcing minimum', async () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    render(<PuzzleValues onChange={onChange} onValid={onValid} />)

    const third = screen.getByPlaceholderText('Value 3')
    await user.type(third, 'Gamma')

    let emitted = lastCallArg<string[]>(onChange.mock)
    expect(emitted).toBeDefined()
    expect(emitted!.length).toBeGreaterThanOrEqual(QUIZ_PUZZLE_VALUES_MIN)
    expect(emitted!.length).toBeGreaterThanOrEqual(3)

    await user.clear(third)
    emitted = lastCallArg<string[]>(onChange.mock)
    expect(emitted).toBeDefined()
    expect(emitted!.length).toBe(QUIZ_PUZZLE_VALUES_MIN)
  })

  it('calls onValid(true) when all required fields are valid per regex', async () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    render(<PuzzleValues onChange={onChange} onValid={onValid} />)
    const user = userEvent.setup()

    // Generate samples that pass your project’s regex
    const candidates = [
      'Alpha',
      'Beta',
      'Gamma',
      'Delta',
      'Epsilon',
      'A',
      'B',
      'C',
      'D',
      'E',
      'abc',
      'xyz',
      'q1',
      'p2',
      'r3',
      '1',
      '2',
      '3',
      '4',
      '5',
      '_',
      '-',
      'X1',
      'Y2',
    ]
    const validSamples: string[] = []
    for (const c of candidates) {
      if (QUIZ_PUZZLE_VALUE_REGEX.test(c)) validSamples.push(c)
      if (validSamples.length >= QUIZ_PUZZLE_VALUES_MIN) break
    }
    if (validSamples.length < QUIZ_PUZZLE_VALUES_MIN) {
      throw new Error(
        'Test could not find enough candidate strings that match QUIZ_PUZZLE_VALUE_REGEX',
      )
    }

    // Fill exactly the required number of fields with valid values
    for (let i = 0; i < QUIZ_PUZZLE_VALUES_MIN; i++) {
      const input = screen.getByPlaceholderText(`Value ${i + 1}`)
      await user.clear(input)
      await user.type(input, validSamples[i])
    }

    await waitFor(() => {
      const v = onValid.mock.calls.length
        ? onValid.mock.calls[onValid.mock.calls.length - 1][0]
        : undefined
      expect(v).toBe(true)
    })
  })

  it('updates from external prop changes without remounting inputs (snapshot)', async () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    const { rerender, container } = render(
      <PuzzleValues onChange={onChange} onValid={onValid} value={['A', 'B']} />,
    )
    expect(container).toMatchSnapshot()

    rerender(
      <PuzzleValues
        onChange={onChange}
        onValid={onValid}
        value={['AA', 'BB', 'CC']}
      />,
    )
    expect(container).toMatchSnapshot()
  })
})
