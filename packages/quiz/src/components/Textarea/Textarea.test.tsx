import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Textarea from './Textarea'

describe('Textarea', () => {
  it('should render a Textarea with default props', async () => {
    const { container } = render(<Textarea id="my-textarea" />)

    expect(container).toMatchSnapshot()
  })

  it('should fire onChange when Textarea receives text', async () => {
    const onChange = vi.fn()

    const { container } = render(
      <Textarea id="my-textarea" onChange={onChange} />,
    )

    const textarea = screen.getByTestId(
      'test-my-textarea-textarea',
    ) as HTMLTextAreaElement
    fireEvent.focus(textarea)
    fireEvent.change(textarea, { target: { value: 'some value' } })

    expect(textarea.value).toBe('some value')

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('some value')

    expect(container).toMatchSnapshot()
  })
})
