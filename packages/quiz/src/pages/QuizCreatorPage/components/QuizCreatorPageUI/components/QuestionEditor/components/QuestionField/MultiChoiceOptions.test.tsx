import { QUIZ_MULTI_CHOICE_OPTIONS_MIN } from '@quiz/common'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import MultiChoiceOptions from './MultiChoiceOptions'

vi.mock('@dnd-kit/core', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = await vi.importActual<any>('@dnd-kit/core')
  let lastProps: Record<string, unknown> | null = null

  const DndContext = (
    props: Record<string, unknown> & { children: React.ReactNode },
  ) => {
    lastProps = props
    return <div data-testid="dnd">{props.children}</div>
  }

  return {
    ...actual,
    DndContext,
    __getLastDndProps: () => lastProps,
  }
})

vi.mock('@dnd-kit/sortable', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = await vi.importActual<any>('@dnd-kit/sortable')
  return {
    ...actual,
    SortableContext: (props: { children: React.ReactNode }) => (
      <>{props.children}</>
    ),
    useSortable: () => ({
      isDragging: false,
      attributes: {},
      listeners: {},
      setNodeRef: () => {},
      setActivatorNodeRef: () => {},
      transform: null,
      transition: null,
    }),
  }
})

vi.mock('../../../../../../../../components', () => {
  return {
    TextField: (props: {
      id: string
      value: string
      checked?: boolean
      placeholder?: string
      regex?: RegExp
      onChange?: (v: string) => void
      onCheck?: (c: boolean) => void
      onValid?: (ok: boolean) => void
      onAdditionalValidation?: () => boolean | string
      required?: boolean
      forceValidate?: boolean
      showErrorMessage?: boolean
      type?: string
    }) => {
      const {
        id,
        value,
        checked,
        placeholder,
        regex,
        onChange,
        onCheck,
        onValid,
        onAdditionalValidation,
        required,
      } = props

      const runValidation = (val: string) => {
        if (!onValid) return
        let ok = true
        const hasValue = val.length > 0

        if (required) {
          ok = ok && hasValue
          if (hasValue && regex) ok = ok && regex.test(val)
          if (onAdditionalValidation)
            ok = ok && onAdditionalValidation() === true
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

      const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
        onCheck?.(e.target.checked)
        // re-run after parent state (options.some(o.correct)) updates
        queueMicrotask(() => runValidation(value))
      }

      // Re-run validation whenever validation-relevant props change
      React.useEffect(() => {
        runValidation(value)
      }, [value, required, regex, onAdditionalValidation, checked])

      return (
        <div data-testid={`textfield-${id}`}>
          <input
            data-testid={`input-${id}`}
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
          />
          <input
            data-testid={`check-${id}`}
            type="checkbox"
            checked={!!checked}
            onChange={handleCheck}
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

describe('MultiChoiceOptions', () => {
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
      <MultiChoiceOptions onChange={onChange} onValid={onValid} />,
    )
    expect(container).toMatchSnapshot()
  })

  it('updates values and emits trimmed array (respects minimum required options)', async () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    render(<MultiChoiceOptions onChange={onChange} onValid={onValid} />)

    const first = await screen.findByPlaceholderText('Option 1')
    const second = await screen.findByPlaceholderText('Option 2')

    await user.clear(first)
    await user.type(first, 'Alpha')
    await user.clear(second)
    await user.type(second, 'Beta')

    const emitted = lastCallArg<{ value: string; correct: boolean }[]>(
      onChange.mock,
    )
    expect(emitted).toBeDefined()
    expect(emitted!.length).toBeGreaterThanOrEqual(
      QUIZ_MULTI_CHOICE_OPTIONS_MIN,
    )
    expect(emitted![0].value).toBe('Alpha')
    expect(emitted![1].value).toBe('Beta')
  })

  it('computes validity and calls onValid(true) when required fields are valid and one is marked correct', async () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    render(<MultiChoiceOptions onChange={onChange} onValid={onValid} />)

    const first = await screen.findByPlaceholderText('Option 1')
    const second = await screen.findByPlaceholderText('Option 2')

    await user.clear(first)
    await user.type(first, 'Alpha')
    await user.clear(second)
    await user.type(second, 'Beta')

    const inputs = screen.getAllByTestId(/input-.*multi-choice-option-.*/)
    const ids = inputs.map((n) => (n as HTMLInputElement).id)
    const checkbox = screen.getByTestId(`check-${ids[1]}`)
    await user.click(checkbox)

    // nudge BOTH required fields so each recalculates validity under the new rule
    await user.type(first, ' ')
    await user.type(first, '{backspace}')
    await user.type(second, ' ')
    await user.type(second, '{backspace}')

    await waitFor(() => {
      const valid = lastCallArg<boolean>(onValid.mock)
      expect(valid).toBe(true)
    })
  })

  it('reorders on drag end and emits reordered values', async () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    render(
      <MultiChoiceOptions
        onChange={onChange}
        onValid={onValid}
        values={[
          { value: 'One', correct: false },
          { value: 'Two', correct: true },
          { value: 'Three', correct: false },
        ]}
      />,
    )

    const inputs = screen.getAllByTestId(/input-.*multi-choice-option-.*/)
    const ids = inputs.map((n) => (n as HTMLInputElement).id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const core: any = await import('@dnd-kit/core')
    const dndProps = core.__getLastDndProps()
    expect(dndProps).toBeTruthy()

    dndProps.onDragEnd?.({
      active: { id: ids[0] },
      over: { id: ids[2] },
    })

    const emitted = lastCallArg<{ value: string; correct: boolean }[]>(
      onChange.mock,
    )
    expect(emitted![0].value).toBe('Two')
    expect(emitted![1].value).toBe('Three')
    expect(emitted![2]?.value).toBe('One')
  })

  it('hides error messages while dragging, then restores after drag end (snapshots)', async () => {
    const onChange = vi.fn()
    const onValid = vi.fn()
    const { container } = render(
      <MultiChoiceOptions onChange={onChange} onValid={onValid} />,
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const core: any = await import('@dnd-kit/core')
    const dndProps = core.__getLastDndProps()

    dndProps.onDragStart?.({ active: { id: 'x' } })
    expect(container).toMatchSnapshot()

    dndProps.onDragEnd?.({ active: { id: 'x' }, over: { id: 'x' } })
    expect(container).toMatchSnapshot()
  })
})
