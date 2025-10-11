import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TrueFalseOptions from './TrueFalseOptions'

vi.mock('../../../../../../../../components', () => {
  return {
    TextField: (props: {
      id: string
      value: string
      checked?: boolean
      onCheck?: (c: boolean) => void
      onValid?: (ok: boolean) => void
      onAdditionalValidation?: () => boolean | string
      forceValidate?: boolean
      type?: string
      readOnly?: boolean
    }) => {
      const { id, checked, onCheck, onValid, onAdditionalValidation } = props

      const runValidation = () => {
        if (!onValid) return
        const a = onAdditionalValidation ? onAdditionalValidation() : true
        onValid(a === true)
      }

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onCheck?.(e.target.checked)
      }

      React.useEffect(() => {
        runValidation()
        // revalidate when selection or validation rule changes
      }, [checked, onAdditionalValidation])

      return (
        <div data-testid={`tf-${id}`}>
          <input
            data-testid={`check-${id}`}
            type="checkbox"
            checked={!!checked}
            onChange={handleChange}
          />
        </div>
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

describe('TrueFalseOptions', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders and matches snapshot', () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    const { container } = render(
      <TrueFalseOptions onChange={onChange} onValid={onValid} />,
    )
    expect(container).toMatchSnapshot()
  })

  it('initial validity is false when nothing selected', async () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    render(<TrueFalseOptions onChange={onChange} onValid={onValid} />)

    await waitFor(() => {
      const v = lastCallArg<boolean>(onValid.mock)
      expect(v).toBe(false)
    })
  })

  it('selecting True emits onChange(true) and sets valid=true', async () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    render(<TrueFalseOptions onChange={onChange} onValid={onValid} />)

    const trueBox = screen.getByTestId('check-true-false-option-0-textfield')
    await user.click(trueBox)

    const lastChange = lastCallArg<boolean | undefined>(onChange.mock)
    expect(lastChange).toBe(true)

    await waitFor(() => {
      const v = lastCallArg<boolean>(onValid.mock)
      expect(v).toBe(true)
    })
  })

  it('selecting False after True emits onChange(false) and keeps valid=true', async () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    render(<TrueFalseOptions onChange={onChange} onValid={onValid} />)

    const trueBox = screen.getByTestId('check-true-false-option-0-textfield')
    const falseBox = screen.getByTestId('check-true-false-option-1-textfield')

    await user.click(trueBox)
    await user.click(falseBox)

    const lastChange = lastCallArg<boolean | undefined>(onChange.mock)
    expect(lastChange).toBe(false)

    await waitFor(() => {
      const v = lastCallArg<boolean>(onValid.mock)
      expect(v).toBe(true)
    })
  })

  it('unchecking the active selection emits onChange(undefined) and sets valid=false', async () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    render(<TrueFalseOptions onChange={onChange} onValid={onValid} />)

    const trueBox = screen.getByTestId('check-true-false-option-0-textfield')

    await user.click(trueBox)
    await user.click(trueBox)

    const lastChange = lastCallArg<boolean | undefined>(onChange.mock)
    expect(lastChange).toBeUndefined()

    await waitFor(() => {
      const v = lastCallArg<boolean>(onValid.mock)
      expect(v).toBe(false)
    })
  })

  it('reflects external value changes (rerender) and stays valid=true when value provided', async () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    const { rerender, container } = render(
      <TrueFalseOptions onChange={onChange} onValid={onValid} />,
    )
    expect(container).toMatchSnapshot()

    rerender(
      <TrueFalseOptions value={true} onChange={onChange} onValid={onValid} />,
    )

    await waitFor(() => {
      const v = lastCallArg<boolean>(onValid.mock)
      expect(v).toBe(true)
    })
    expect(container).toMatchSnapshot()

    rerender(
      <TrueFalseOptions value={false} onChange={onChange} onValid={onValid} />,
    )

    await waitFor(() => {
      const v = lastCallArg<boolean>(onValid.mock)
      expect(v).toBe(true)
    })
    expect(container).toMatchSnapshot()
  })
})
