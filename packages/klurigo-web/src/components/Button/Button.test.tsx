import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Button from './Button'

describe('Button', () => {
  it('should render a Button with default props', async () => {
    const { container } = render(
      <Button id="my-button" type="button" value="My Button" />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should receive onClick event when button is clicked', async () => {
    const onClick = vi.fn()

    const { container } = render(
      <Button
        id="my-button"
        type="button"
        value="My Button"
        onClick={onClick}
      />,
    )

    const button = screen.getByTestId(
      'test-my-button-button',
    ) as HTMLButtonElement

    fireEvent.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)

    expect(container).toMatchSnapshot()
  })
})
