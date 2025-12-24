import {
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import QuizTable, {
  type QuizTableItem,
  type QuizTablePagination,
} from './QuizTable'

const PLAYER_ID = '490fbab7-dc75-47fe-bf17-048308eaad14'

const updated = new Date('2025-02-14T15:31:14.000Z')

const mockItems: QuizTableItem[] = [
  {
    id: '1',
    title: 'Quiz 1',
    description: 'Description for Quiz 1',
    mode: GameMode.Classic,
    visibility: QuizVisibility.Public,
    category: QuizCategory.GeneralKnowledge,
    imageCoverURL: 'https://example.com/image1.jpg',
    languageCode: LanguageCode.English,
    numberOfQuestions: 14,
    author: { id: PLAYER_ID, name: 'FrostyBear' },
    updated,
  },
  {
    id: '2',
    title: 'Quiz 2',
    description: 'Description for Quiz 2',
    mode: GameMode.ZeroToOneHundred,
    visibility: QuizVisibility.Private,
    category: QuizCategory.GeneralKnowledge,
    imageCoverURL: 'https://example.com/image2.jpg',
    languageCode: LanguageCode.English,
    numberOfQuestions: 28,
    author: { id: PLAYER_ID, name: 'FrostyBear' },
    updated,
  },
]

const mockPagination: QuizTablePagination = {
  total: 10,
  limit: 2,
  offset: 0,
}

const mockOnPagination = vi.fn()

describe('QuizTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the table with items', () => {
    const { container } = render(
      <MemoryRouter>
        <QuizTable
          items={mockItems}
          pagination={mockPagination}
          onPagination={mockOnPagination}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Quiz 1')).toBeInTheDocument()
    expect(screen.getByText('Description for Quiz 1')).toBeInTheDocument()
    expect(screen.getByText('Quiz 2')).toBeInTheDocument()
    expect(screen.getByText('Description for Quiz 2')).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: 'image' }).length).toBe(2)
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  it('disables the previous button on the first page', () => {
    const { container } = render(
      <MemoryRouter>
        <QuizTable
          items={mockItems}
          pagination={mockPagination}
          onPagination={mockOnPagination}
        />
      </MemoryRouter>,
    )

    const prevButton = screen.getByTestId('test-prev-page-button-button')
    expect(prevButton).toBeDisabled()

    expect(container).toMatchSnapshot()
  })

  it('disables the next button on the last page', () => {
    const { container } = render(
      <MemoryRouter>
        <QuizTable
          items={mockItems}
          pagination={{ ...mockPagination, offset: 8 }}
          onPagination={mockOnPagination}
        />
      </MemoryRouter>,
    )

    const nextButton = screen.getByTestId('test-next-page-button-button')
    expect(nextButton).toBeDisabled()

    expect(container).toMatchSnapshot()
  })

  it('calls onPagination when navigating to the next page', () => {
    const { container } = render(
      <MemoryRouter>
        <QuizTable
          items={mockItems}
          pagination={mockPagination}
          onPagination={mockOnPagination}
        />
      </MemoryRouter>,
    )

    const nextButton = screen.getByTestId('test-next-page-button-button')
    fireEvent.click(nextButton)

    expect(mockOnPagination).toHaveBeenCalledTimes(1)
    expect(mockOnPagination).toHaveBeenCalledWith(2, 2) // limit, offset

    expect(container).toMatchSnapshot()
  })

  it('calls onPagination when navigating to the previous page', () => {
    const { container } = render(
      <MemoryRouter>
        <QuizTable
          items={mockItems}
          pagination={{ ...mockPagination, offset: 2 }}
          onPagination={mockOnPagination}
        />
      </MemoryRouter>,
    )

    const prevButton = screen.getByTestId('test-prev-page-button-button')
    fireEvent.click(prevButton)

    expect(mockOnPagination).toHaveBeenCalledTimes(1)
    expect(mockOnPagination).toHaveBeenCalledWith(2, 0) // limit, offset

    expect(container).toMatchSnapshot()
  })

  it('handles edge case: renders without items', () => {
    const { container } = render(
      <MemoryRouter>
        <QuizTable
          items={[]}
          pagination={mockPagination}
          onPagination={mockOnPagination}
        />
      </MemoryRouter>,
    )

    expect(screen.queryByText('Quiz 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Page 1 of 5')).toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })
})
