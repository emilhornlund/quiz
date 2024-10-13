import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import Select from './Select'

describe('Select', () => {
  it('should render a Select with default props', async () => {
    const { container } = render(<Select id="my-select" />)

    expect(container).toMatchSnapshot()
  })

  it('should fire Select when Select option', async () => {
    const onChange = vi.fn()

    const { container } = render(
      <Select
        id="my-select"
        values={[
          { key: 'option-1', value: 'option-1', valueLabel: 'Option 1' },
          { key: 'option-2', value: 'option-2', valueLabel: 'Option 2' },
          { key: 'option-3', value: 'option-3', valueLabel: 'Option 3' },
        ]}
        onChange={onChange}
      />,
    )

    const selectElement = screen.getByTestId(
      'test-my-select-select',
    ) as HTMLSelectElement
    fireEvent.focus(selectElement)
    fireEvent.change(selectElement, { target: { value: 'option-1' } })

    expect(selectElement.value).toBe('option-1')

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('option-1')

    expect(container).toMatchSnapshot()
  })

  it('should render a Select with disabled props', async () => {
    const { container } = render(<Select id="my-select" disabled />)

    expect(container).toMatchSnapshot()
  })
})
