import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import TextField from './TextField'

describe('TextField', () => {
  it('should render a TextField with type text', async () => {
    const { container } = render(<TextField id="my-textfield" type="text" />)

    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'some value' } })

    expect(container).toMatchSnapshot()
  })

  it('should render a TextField with type number', async () => {
    const { container } = render(<TextField id="my-textfield" type="number" />)

    expect(container).toMatchSnapshot()
  })

  it('should receive onChange event when text changes', async () => {
    const onChange = vi.fn()

    const { container } = render(
      <TextField id="my-textfield" type="text" onChange={onChange} />,
    )

    const input = screen.getByTestId(
      'test-my-textfield-textfield',
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'some value' } })

    expect(input.value).toBe('some value')

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('some value')

    expect(container).toMatchSnapshot()
  })

  it('should receive onChange event when number changes', async () => {
    const onChange = vi.fn()

    const { container } = render(
      <TextField id="my-textfield" type="number" onChange={onChange} />,
    )

    const input = screen.getByTestId(
      'test-my-textfield-textfield',
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '1337' } })

    expect(input.value).toBe('1337')

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(1337)

    expect(container).toMatchSnapshot()
  })

  it('should receive onChange event when number equal min changes', async () => {
    const onChange = vi.fn()

    const { container } = render(
      <TextField id="my-textfield" type="number" min={0} onChange={onChange} />,
    )

    const input = screen.getByTestId(
      'test-my-textfield-textfield',
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '0' } })

    expect(input.value).toBe('0')

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(0)

    expect(container).toMatchSnapshot()
  })

  it('should receive onChange event when number equal max changes', async () => {
    const onChange = vi.fn()

    const { container } = render(
      <TextField
        id="my-textfield"
        type="number"
        max={100}
        onChange={onChange}
      />,
    )

    const input = screen.getByTestId(
      'test-my-textfield-textfield',
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '100' } })

    expect(input.value).toBe('100')

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(100)

    expect(container).toMatchSnapshot()
  })

  it('should not receive onChange event when not a number changes', async () => {
    const onChange = vi.fn()

    const { container } = render(
      <TextField
        id="my-textfield"
        type="number"
        min={0}
        max={100}
        onChange={onChange}
      />,
    )

    const input = screen.getByTestId(
      'test-my-textfield-textfield',
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'not a number' } })

    expect(input.value).toBe('')

    expect(onChange).not.toHaveBeenCalled()

    expect(container).toMatchSnapshot()
  })

  it('should not receive onChange event when number bellow min changes', async () => {
    const onChange = vi.fn()

    const { container } = render(
      <TextField
        id="my-textfield"
        type="number"
        min={0}
        max={100}
        onChange={onChange}
      />,
    )

    const input = screen.getByTestId(
      'test-my-textfield-textfield',
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '-1' } })

    expect(onChange).toHaveBeenCalled()

    expect(container).toMatchSnapshot()
  })

  it('should not receive onChange event when number above max changes', async () => {
    const onChange = vi.fn()

    const { container } = render(
      <TextField
        id="my-textfield"
        type="number"
        min={0}
        max={100}
        onChange={onChange}
      />,
    )

    const input = screen.getByTestId(
      'test-my-textfield-textfield',
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '101' } })

    expect(onChange).toHaveBeenCalled()

    expect(container).toMatchSnapshot()
  })
})
