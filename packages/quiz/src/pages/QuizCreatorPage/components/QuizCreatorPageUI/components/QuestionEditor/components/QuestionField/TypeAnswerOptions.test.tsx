import {
  QUIZ_TYPE_ANSWER_OPTIONS_MAX,
  QUIZ_TYPE_ANSWER_OPTIONS_MIN,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_REGEX,
} from '@quiz/common'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TypeAnswerOptions from './TypeAnswerOptions'

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

describe('TypeAnswerOptions', () => {
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
      <TypeAnswerOptions onChange={onChange} onValid={onValid} />,
    )
    expect(container).toMatchSnapshot()
  })

  it('initializes max inputs with correct placeholders', () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    render(<TypeAnswerOptions onChange={onChange} onValid={onValid} />)
    const inputs = Array.from(
      { length: QUIZ_TYPE_ANSWER_OPTIONS_MAX },
      (_, i) => screen.getByPlaceholderText(`Option ${i + 1}`),
    )
    expect(inputs.length).toBe(QUIZ_TYPE_ANSWER_OPTIONS_MAX)
  })

  it('updates values and emits trimmed slice honoring minimum', async () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    render(<TypeAnswerOptions onChange={onChange} onValid={onValid} />)

    const first = screen.getByPlaceholderText('Option 1')
    const second = screen.getByPlaceholderText('Option 2')

    await user.clear(first)
    await user.type(first, 'Alpha')
    await user.clear(second)
    await user.type(second, 'Beta')

    const emitted = lastCallArg<string[]>(onChange.mock)
    expect(emitted).toBeDefined()
    expect(emitted!.length).toBeGreaterThanOrEqual(QUIZ_TYPE_ANSWER_OPTIONS_MIN)
    expect(emitted![0]).toBe('Alpha')
    expect(emitted![1]).toBe('Beta')
  })

  it('trims to last non-empty index while enforcing minimum', async () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    render(<TypeAnswerOptions onChange={onChange} onValid={onValid} />)

    const third = screen.getByPlaceholderText('Option 3')
    await user.type(third, 'Gamma')

    let emitted = lastCallArg<string[]>(onChange.mock)
    expect(emitted).toBeDefined()
    expect(emitted!.length).toBeGreaterThanOrEqual(3)

    await user.clear(third)
    emitted = lastCallArg<string[]>(onChange.mock)
    expect(emitted).toBeDefined()
    expect(emitted!.length).toBe(QUIZ_TYPE_ANSWER_OPTIONS_MIN)
  })

  it('calls onValid(true) when all required fields are valid per regex', async () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    render(<TypeAnswerOptions onChange={onChange} onValid={onValid} />)

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
    const valid: string[] = []
    for (const c of candidates) {
      if (QUIZ_TYPE_ANSWER_OPTIONS_VALUE_REGEX.test(c)) valid.push(c)
      if (valid.length >= QUIZ_TYPE_ANSWER_OPTIONS_MIN) break
    }
    if (valid.length < QUIZ_TYPE_ANSWER_OPTIONS_MIN) {
      throw new Error('Not enough regex-valid candidates for the test')
    }

    for (let i = 0; i < QUIZ_TYPE_ANSWER_OPTIONS_MIN; i++) {
      const input = screen.getByPlaceholderText(`Option ${i + 1}`)
      await user.clear(input)
      await user.type(input, valid[i])
    }

    await waitFor(() => {
      const v = lastCallArg<boolean>(onValid.mock)
      expect(v).toBe(true)
    })
  })

  it('optional empty fields do not block validity once minimum required are valid', async () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    render(<TypeAnswerOptions onChange={onChange} onValid={onValid} />)

    const first = screen.getByPlaceholderText('Option 1')
    const second = screen.getByPlaceholderText('Option 2')

    const v1 = QUIZ_TYPE_ANSWER_OPTIONS_VALUE_REGEX.test('Alpha')
      ? 'Alpha'
      : 'A'
    const v2 = QUIZ_TYPE_ANSWER_OPTIONS_VALUE_REGEX.test('Beta') ? 'Beta' : 'B'

    await user.clear(first)
    await user.type(first, v1)
    await user.clear(second)
    await user.type(second, v2)

    const fourth = screen.getByPlaceholderText('Option 4')
    await user.clear(fourth)

    await waitFor(() => {
      const v = lastCallArg<boolean>(onValid.mock)
      expect(v).toBe(true)
    })
  })

  it('reflects external values on rerender without remounting inputs (snapshots)', () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    const { rerender, container } = render(
      <TypeAnswerOptions
        onChange={onChange}
        onValid={onValid}
        values={['One']}
      />,
    )
    expect(container).toMatchSnapshot()

    rerender(
      <TypeAnswerOptions
        onChange={onChange}
        onValid={onValid}
        values={['One', 'Two', 'Three']}
      />,
    )
    expect(container).toMatchSnapshot()
  })
})
