import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import PageProminentIcon from './PageProminentIcon'

describe('PageProminentIcon', () => {
  it('renders the image with src and alt', () => {
    render(
      <PageProminentIcon
        src="/assets/images/klurigo-icon.svg"
        alt="Klurigo logo"
      />,
    )

    const img = screen.getByRole('img', { name: 'Klurigo logo' })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/assets/images/klurigo-icon.svg')
    expect(img).toHaveAttribute('alt', 'Klurigo logo')
    expect(img).toHaveClass('image')
  })

  it('applies wrapper classes', () => {
    const { container } = render(
      <PageProminentIcon
        src="/assets/images/klurigo-icon.svg"
        alt="Klurigo logo"
      />,
    )

    const main = container.querySelector('.main')
    expect(main).not.toBeNull()

    const float = container.querySelector('.float')
    expect(float).not.toBeNull()

    const img = container.querySelector('img.image')
    expect(img).not.toBeNull()
  })

  it('matches snapshot', () => {
    const { container } = render(
      <PageProminentIcon
        src="/assets/images/klurigo-icon.svg"
        alt="Klurigo logo"
      />,
    )

    expect(container.firstChild).toMatchSnapshot()
  })
})
