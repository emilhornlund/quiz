import { GameMode, LanguageCode, QuizVisibility } from '@quiz/common'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import QuizTable, { QuizTableItem, QuizTablePagination } from './QuizTable'

const mockItems: QuizTableItem[] = [
  {
    id: '1',
    title: 'Quiz 1',
    description: 'Description for Quiz 1',
    mode: GameMode.Classic,
    visibility: QuizVisibility.Public,
    imageCoverURL: 'https://example.com/image1.jpg',
    languageCode: LanguageCode.English,
  },
  {
    id: '2',
    title: 'Quiz 2',
    description: 'Description for Quiz 2',
    mode: GameMode.ZeroToOneHundred,
    visibility: QuizVisibility.Private,
    imageCoverURL: 'https://example.com/image2.jpg',
    languageCode: LanguageCode.English,
  },
]

const mockPagination: QuizTablePagination = {
  total: 10,
  limit: 2,
  offset: 0,
}

const mockOnEdit = vi.fn()
const mockOnHostGame = vi.fn()
const mockOnPagination = vi.fn()

describe('QuizTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the table with items', () => {
    const { container } = render(
      <QuizTable
        items={mockItems}
        pagination={mockPagination}
        onEdit={mockOnEdit}
        onHostGame={mockOnHostGame}
        onPagination={mockOnPagination}
      />,
    )

    expect(screen.getByText('Quiz 1')).toBeInTheDocument()
    expect(screen.getByText('Description for Quiz 1')).toBeInTheDocument()
    expect(screen.getByText('Quiz 2')).toBeInTheDocument()
    expect(screen.getByText('Description for Quiz 2')).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: 'image' }).length).toBe(2)
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  it('calls onEdit when the edit button is clicked', () => {
    const { container } = render(
      <QuizTable
        items={mockItems}
        pagination={mockPagination}
        onEdit={mockOnEdit}
        onHostGame={mockOnHostGame}
        onPagination={mockOnPagination}
      />,
    )

    const editButton = screen.getAllByRole('button', { name: 'Edit' })[0]
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledTimes(1)
    expect(mockOnEdit).toHaveBeenCalledWith('1')

    expect(container).toMatchSnapshot()
  })

  it('calls onHostGame when the confirm dialog button button is clicked', () => {
    const { container } = render(
      <QuizTable
        items={mockItems}
        pagination={mockPagination}
        onEdit={mockOnEdit}
        onHostGame={mockOnHostGame}
        onPagination={mockOnPagination}
      />,
    )

    const hostButton = screen.getAllByRole('button', { name: 'Host Game' })[0]
    fireEvent.click(hostButton)

    const confirmButton = screen.getAllByRole('button', { name: 'Confirm' })[0]
    fireEvent.click(confirmButton)

    expect(mockOnHostGame).toHaveBeenCalledTimes(1)
    expect(mockOnHostGame).toHaveBeenCalledWith('1')

    expect(container).toMatchSnapshot()
  })

  it('do not calls onHostGame when the close dialog button is clicked', () => {
    const { container } = render(
      <QuizTable
        items={mockItems}
        pagination={mockPagination}
        onEdit={mockOnEdit}
        onHostGame={mockOnHostGame}
        onPagination={mockOnPagination}
      />,
    )

    const hostButton = screen.getAllByRole('button', { name: 'Host Game' })[0]
    fireEvent.click(hostButton)

    const closeButton = screen.getAllByRole('button', { name: 'Close' })[0]
    fireEvent.click(closeButton)

    expect(mockOnHostGame).not.toHaveBeenCalled()

    expect(container).toMatchSnapshot()
  })

  it('disables the previous button on the first page', () => {
    const { container } = render(
      <QuizTable
        items={mockItems}
        pagination={mockPagination}
        onEdit={mockOnEdit}
        onHostGame={mockOnHostGame}
        onPagination={mockOnPagination}
      />,
    )

    const prevButton = screen.getByTestId('test-prev-page-button-button')
    expect(prevButton).toBeDisabled()

    expect(container).toMatchSnapshot()
  })

  it('disables the next button on the last page', () => {
    const { container } = render(
      <QuizTable
        items={mockItems}
        pagination={{ ...mockPagination, offset: 8 }}
        onEdit={mockOnEdit}
        onHostGame={mockOnHostGame}
        onPagination={mockOnPagination}
      />,
    )

    const nextButton = screen.getByTestId('test-next-page-button-button')
    expect(nextButton).toBeDisabled()

    expect(container).toMatchSnapshot()
  })

  it('calls onPagination when navigating to the next page', () => {
    const { container } = render(
      <QuizTable
        items={mockItems}
        pagination={mockPagination}
        onEdit={mockOnEdit}
        onHostGame={mockOnHostGame}
        onPagination={mockOnPagination}
      />,
    )

    const nextButton = screen.getByTestId('test-next-page-button-button')
    fireEvent.click(nextButton)

    expect(mockOnPagination).toHaveBeenCalledTimes(1)
    expect(mockOnPagination).toHaveBeenCalledWith(2, 2) // limit, offset

    expect(container).toMatchSnapshot()
  })

  it('calls onPagination when navigating to the previous page', () => {
    const { container } = render(
      <QuizTable
        items={mockItems}
        pagination={{ ...mockPagination, offset: 2 }}
        onEdit={mockOnEdit}
        onHostGame={mockOnHostGame}
        onPagination={mockOnPagination}
      />,
    )

    const prevButton = screen.getByTestId('test-prev-page-button-button')
    fireEvent.click(prevButton)

    expect(mockOnPagination).toHaveBeenCalledTimes(1)
    expect(mockOnPagination).toHaveBeenCalledWith(2, 0) // limit, offset

    expect(container).toMatchSnapshot()
  })

  it('handles edge case: renders without items', () => {
    const { container } = render(
      <QuizTable
        items={[]}
        pagination={mockPagination}
        onEdit={mockOnEdit}
        onHostGame={mockOnHostGame}
        onPagination={mockOnPagination}
      />,
    )

    expect(screen.queryByText('Quiz 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Page 1 of 5')).toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })
})
