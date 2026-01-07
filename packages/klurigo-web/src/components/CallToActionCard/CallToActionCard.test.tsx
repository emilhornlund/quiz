import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import CallToActionCard from './CallToActionCard'

describe(CallToActionCard.name, () => {
  const renderCard = (
    overrides?: Partial<ComponentProps<typeof CallToActionCard>>,
  ) => {
    const onClick = vi.fn()

    const props: ComponentProps<typeof CallToActionCard> = {
      title: 'Make every game count',
      text: 'Create an account to save your results.',
      onClick,
      ...overrides,
    }

    render(<CallToActionCard {...props} />)

    return { props, onClick }
  }

  it('renders the provided title and text', () => {
    renderCard({
      title: 'Resume game',
      text: 'Jump back in where you left off',
    })

    expect(screen.getByText('Resume game')).toBeInTheDocument()
    expect(
      screen.getByText('Jump back in where you left off'),
    ).toBeInTheDocument()
  })

  it('renders a single button with type="button"', () => {
    renderCard()

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('invokes onClick when the button is clicked', async () => {
    const user = userEvent.setup()
    const { onClick } = renderCard()

    await user.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('invokes onClick once per click (multiple clicks)', async () => {
    const user = userEvent.setup()
    const { onClick } = renderCard()

    const button = screen.getByRole('button')

    await user.click(button)
    await user.click(button)
    await user.click(button)

    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it('can be activated via keyboard (Enter) when focused', async () => {
    const user = userEvent.setup()
    const { onClick } = renderCard()

    const button = screen.getByRole('button')
    button.focus()
    expect(button).toHaveFocus()

    await user.keyboard('{Enter}')

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('can be activated via keyboard (Space) when focused', async () => {
    const user = userEvent.setup()
    const { onClick } = renderCard()

    const button = screen.getByRole('button')
    button.focus()
    expect(button).toHaveFocus()

    await user.keyboard(' ')

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick on render', () => {
    const onClick = vi.fn()

    render(<CallToActionCard title="Title" text="Text" onClick={onClick} />)

    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders the icon container (arrow) as decorative content', () => {
    const { container } = render(
      <CallToActionCard title="Title" text="Text" onClick={() => {}} />,
    )

    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('uses the title as part of the accessible button name', () => {
    renderCard({ title: 'Create account', text: 'Save your results' })

    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument()
  })

  it('includes both title and text in the accessible button name', () => {
    renderCard({ title: 'Create account', text: 'Save your results' })

    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /save your results/i }),
    ).toBeInTheDocument()
  })
})
