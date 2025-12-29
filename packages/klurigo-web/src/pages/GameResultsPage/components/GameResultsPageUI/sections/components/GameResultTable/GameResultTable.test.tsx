import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import GameResultTable, { type TableItem } from './GameResultTable'

describe('GameResultTable', () => {
  const items: TableItem[] = [
    {
      type: 'table-row',
      badge: 1,
      value: 'Alice Anderson',
      progress: 82,
      details: [
        {
          title: 'Correct',
          value: '8/10',
          icon: faChevronDown,
          iconColor: '#333',
        },
        { title: 'Fastest', value: '3.2s' },
      ],
    },
    {
      type: 'table-row',
      badge: 2,
      value: 'Bob Brown',
      progress: 50,
    },
  ]

  it('renders one row per item', () => {
    const { container } = render(<GameResultTable items={items} />)
    const rows = container.querySelectorAll('.tableRow')
    expect(rows.length).toBe(2)
    expect(container).toMatchSnapshot()
  })

  it('renders badge and value, and sets title attribute on value', () => {
    const { container } = render(<GameResultTable items={items} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
    expect(screen.getByText('Bob Brown')).toBeInTheDocument()

    const valueEls = Array.from(
      container.querySelectorAll('.tableRow .value'),
    ) as HTMLElement[]
    const aliceValueEl = valueEls.find(
      (el) => el.textContent === 'Alice Anderson',
    ) as HTMLElement
    const bobValueEl = valueEls.find(
      (el) => el.textContent === 'Bob Brown',
    ) as HTMLElement
    expect(aliceValueEl).toHaveAttribute('title', 'Alice Anderson')
    expect(bobValueEl).toHaveAttribute('title', 'Bob Brown')

    expect(container).toMatchSnapshot()
  })

  it('renders one chevron icon in the main area per row', () => {
    const { container } = render(<GameResultTable items={items} />)
    const rows = Array.from(container.querySelectorAll('.tableRow'))
    expect(rows.length).toBe(items.length)
    rows.forEach((row) => {
      const chevrons = row.querySelectorAll(
        '.main svg[data-icon="chevron-down"]',
      )
      expect(chevrons.length).toBe(1)
    })
  })

  it('hides details by default and toggles them on row click', () => {
    const { container } = render(<GameResultTable items={items} />)
    const rows = container.querySelectorAll('.tableRow')
    const firstRow = rows.item(0) as HTMLElement
    const firstRowDetails = firstRow.querySelector('.details') as HTMLElement

    expect(firstRowDetails.className).not.toContain('active')
    fireEvent.click(firstRow)

    expect(firstRowDetails.className).toContain('active')
    expect(screen.getByText('Correct')).toBeInTheDocument()
    expect(screen.getByText('8/10')).toBeInTheDocument()
    expect(screen.getByText('Fastest')).toBeInTheDocument()
    expect(screen.getByText('3.2s')).toBeInTheDocument()

    fireEvent.click(firstRow)
    expect(firstRowDetails.className).not.toContain('active')

    expect(container).toMatchSnapshot()
  })

  it('does not crash when details are missing', () => {
    const minimal: TableItem[] = [
      {
        type: 'table-row',
        badge: 3,
        value: 'Charlie',
        progress: 10,
      },
    ]
    const { container } = render(<GameResultTable items={minimal} />)
    const row = container.querySelector('.tableRow') as HTMLElement
    const details = row.querySelector('.details') as HTMLElement
    fireEvent.click(row)
    expect(details.className).toContain('active')

    expect(container).toMatchSnapshot()
  })

  it('renders separator correctly', () => {
    const { container } = render(
      <GameResultTable items={[{ type: 'table-separator' }]} />,
    )
    const rows = container.querySelectorAll('.tableSeparator')
    expect(rows.length).toBe(1)
    expect(container).toMatchSnapshot()
  })
})
