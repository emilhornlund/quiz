import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import SegmentedControl from './SegmentedControl'

describe('SegmentedControl', () => {
  it('should render a primary normal SegmentedControl', async () => {
    const { container } = render(
      <SegmentedControl
        id="my-primary-normal-segmented-control"
        kind="primary"
        size="normal"
        values={[
          { key: 'first', value: 'first', valueLabel: 'First' },
          { key: 'second', value: 'second', valueLabel: 'Second' },
          { key: 'third', value: 'third', valueLabel: 'Third' },
        ]}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render a primary small SegmentedControl', async () => {
    const { container } = render(
      <SegmentedControl
        id="my-primary-small-segmented-control"
        kind="primary"
        size="small"
        values={[
          { key: 'first', value: 'first', valueLabel: 'First' },
          { key: 'second', value: 'second', valueLabel: 'Second' },
          { key: 'third', value: 'third', valueLabel: 'Third' },
        ]}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render a secondary normal SegmentedControl', async () => {
    const { container } = render(
      <SegmentedControl
        id="my-secondary-normal-segmented-control"
        kind="secondary"
        size="normal"
        values={[
          { key: 'first', value: 'first', valueLabel: 'First' },
          { key: 'second', value: 'second', valueLabel: 'Second' },
          { key: 'third', value: 'third', valueLabel: 'Third' },
        ]}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render a secondary small SegmentedControl', async () => {
    const { container } = render(
      <SegmentedControl
        id="my-secondary-small-segmented-control"
        kind="secondary"
        size="small"
        values={[
          { key: 'first', value: 'first', valueLabel: 'First' },
          { key: 'second', value: 'second', valueLabel: 'Second' },
          { key: 'third', value: 'third', valueLabel: 'Third' },
        ]}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should receive onChange event when segmented control item is clicked', async () => {
    const onChange = vi.fn()

    const { container } = render(
      <SegmentedControl
        id="my-primary-normal-segmented-control"
        kind="primary"
        size="normal"
        values={[
          { key: 'first', value: 'first', valueLabel: 'First' },
          { key: 'second', value: 'second', valueLabel: 'Second' },
          { key: 'third', value: 'third', valueLabel: 'Third' },
        ]}
        onChange={onChange}
      />,
    )

    const button = screen.getByTestId(
      'test-my-primary-normal-segmented-control_second-segmented-control',
    ) as HTMLButtonElement

    fireEvent.click(button)

    expect(onChange).toHaveBeenCalledWith('second')

    expect(container).toMatchSnapshot()
  })
})
