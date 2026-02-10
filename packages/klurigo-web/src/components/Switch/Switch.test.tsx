import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type FC, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import Switch from './Switch'

const ControlledHarness: FC<{
  id?: string
  label?: string
  initialValue?: boolean
  onChange?: (value: boolean) => void
}> = ({ id, label, initialValue = false, onChange }) => {
  const [value, setValue] = useState<boolean>(initialValue)

  return (
    <Switch
      id={id}
      label={label}
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange?.(next)
      }}
    />
  )
}

describe('Switch', () => {
  it('renders a checkbox with role="switch"', () => {
    render(<Switch id="my-switch" label="Switch Label" value={false} />)

    const input = screen.getByRole('switch')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'checkbox')
  })

  it('uses the provided id when given', () => {
    render(<Switch id="my-switch" label="Switch Label" value={false} />)

    const input = screen.getByRole('switch')
    expect(input).toHaveAttribute('id', 'my-switch')
  })

  it('generates a stable id when no id is provided', () => {
    const { rerender } = render(<Switch label="Switch Label" value={false} />)

    const inputBefore = screen.getByRole('switch')
    const idBefore = inputBefore.getAttribute('id')
    expect(idBefore).toBeTruthy()

    rerender(<Switch label="Switch Label" value={false} />)

    const inputAfter = screen.getByRole('switch')
    const idAfter = inputAfter.getAttribute('id')
    expect(idAfter).toBe(idBefore)
  })

  it('renders the label text and sets title when label is provided', () => {
    render(<Switch id="my-switch" label="Switch Label" value={false} />)

    const labelText = screen.getByText('Switch Label')
    expect(labelText).toBeInTheDocument()
    expect(labelText).toHaveAttribute('title', 'Switch Label')
  })

  it('does not render label text span when label is not provided', () => {
    render(<Switch id="my-switch" value={false} />)

    expect(screen.queryByText(/.+/)).not.toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('reflects checked state from value prop', () => {
    const { rerender } = render(
      <Switch id="my-switch" label="Switch Label" value={false} />,
    )

    const input = screen.getByRole('switch') as HTMLInputElement
    expect(input.checked).toBe(false)

    rerender(<Switch id="my-switch" label="Switch Label" value />)
    expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(true)
  })

  it('calls onChange with true when toggled from unchecked -> checked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <Switch
        id="my-switch"
        label="Switch Label"
        value={false}
        onChange={onChange}
      />,
    )

    const input = screen.getByRole('switch')
    await user.click(input)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange with false when toggled from checked -> unchecked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <Switch id="my-switch" label="Switch Label" value onChange={onChange} />,
    )

    const input = screen.getByRole('switch')
    await user.click(input)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('does not throw when onChange is not provided and user toggles', async () => {
    const user = userEvent.setup()

    render(<Switch id="my-switch" label="Switch Label" value={false} />)

    const input = screen.getByRole('switch')
    await expect(user.click(input)).resolves.not.toThrow()
  })

  it('toggles when clicking the label text (entire label container is clickable)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <Switch
        id="my-switch"
        label="Switch Label"
        value={false}
        onChange={onChange}
      />,
    )

    await user.click(screen.getByText('Switch Label'))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('toggles when clicking the slider element area (click bubbles via label)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    const { container } = render(
      <Switch
        id="my-switch"
        label="Switch Label"
        value={false}
        onChange={onChange}
      />,
    )

    const slider = container.querySelector('span[class*="slider"]')
    expect(slider).toBeTruthy()

    await user.click(slider as HTMLElement)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('supports keyboard interaction: Space toggles when focused', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <Switch
        id="my-switch"
        label="Switch Label"
        value={false}
        onChange={onChange}
      />,
    )

    const input = screen.getByRole('switch')
    input.focus()
    expect(input).toHaveFocus()

    await user.keyboard('[Space]')

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('is a controlled component: value does not change unless parent updates it', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <Switch
        id="my-switch"
        label="Switch Label"
        value={false}
        onChange={onChange}
      />,
    )

    const input = screen.getByRole('switch') as HTMLInputElement
    expect(input.checked).toBe(false)

    await user.click(input)

    expect(onChange).toHaveBeenCalledWith(true)
    expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(false)
  })

  it('controlled harness updates checked state after onChange is emitted', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <ControlledHarness
        id="my-switch"
        label="Switch Label"
        initialValue={false}
        onChange={onChange}
      />,
    )

    const input = screen.getByRole('switch') as HTMLInputElement
    expect(input.checked).toBe(false)

    await user.click(input)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
    expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(true)

    await user.click(input)

    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenLastCalledWith(false)
    expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(false)
  })

  it('fires onChange with correct checked value when clicked (fireEvent)', () => {
    const onChange = vi.fn()

    render(
      <Switch
        id="my-switch"
        label="Switch Label"
        value={false}
        onChange={onChange}
      />,
    )

    const input = screen.getByRole('switch') as HTMLInputElement

    fireEvent.click(input)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
