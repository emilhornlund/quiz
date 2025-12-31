import {
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizVisibility,
} from '@klurigo/common'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import QuizDetailsPageUI from './QuizDetailsPageUI'

vi.mock('../../../../components', async () => {
  const Button = ({
    id,
    value,
    onClick,
  }: {
    id?: string
    value?: string
    onClick?: () => void
  }) => (
    <button type="button" id={id} onClick={onClick}>
      {value}
    </button>
  )

  const Page = ({
    header,
    children,
  }: {
    header?: React.ReactNode
    children?: React.ReactNode
  }) => (
    <div data-testid="page">
      <div data-testid="page-header">{header}</div>
      <div data-testid="page-body">{children}</div>
    </div>
  )

  const Typography = ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="typography">{children}</div>
  )

  const LoadingSpinner = () => <div data-testid="loading-spinner" />

  const ResponsiveImage = ({ imageURL }: { imageURL: string }) => (
    <img data-testid="responsive-image" alt="cover" src={imageURL} />
  )

  const ConfirmDialog = ({
    title,
    message,
    open,
    loading,
    destructive,
    onConfirm,
    onClose,
  }: {
    title: string
    message: string
    open: boolean
    loading?: boolean
    destructive?: boolean
    onConfirm: () => void
    onClose: () => void
  }) => {
    if (!open) return null

    return (
      <div
        data-testid={`confirm-dialog-${title}`}
        data-loading={loading ? 'true' : 'false'}
        data-destructive={destructive ? 'true' : 'false'}>
        <div>{title}</div>
        <div>{message}</div>
        <button type="button" onClick={onConfirm}>
          confirm
        </button>
        <button type="button" onClick={onClose}>
          close
        </button>
      </div>
    )
  }

  return {
    Button,
    ConfirmDialog,
    LoadingSpinner,
    Page,
    ResponsiveImage,
    Typography,
  }
})

const created = new Date('2025-02-14T15:31:14.000Z')
const updated = new Date('2025-03-08T15:31:14.000Z')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeQuiz = (overrides: Partial<any> = {}) => ({
  id: 'd12cf443-3fa9-4a0e-8778-d9c182903146',
  title: 'The Ultimate Geography Challenge',
  description:
    'Test your knowledge of world capitals, landmarks, and continents in this fun and educational geography quiz.',
  mode: GameMode.Classic,
  visibility: QuizVisibility.Public,
  category: QuizCategory.GeneralKnowledge,
  imageCoverURL:
    'https://0utwqfl7.cdn.imgeng.in/explore-academics/programs/images/undergraduate/henson/geographymajorMH.jpg',
  languageCode: LanguageCode.English,
  numberOfQuestions: 14,
  author: {
    id: 'db8d4c90-bfc2-4c2e-93cc-8f1c7eda34ec',
    name: 'FrostyBear',
  },
  created,
  updated,
  ...overrides,
})

const renderUI = (
  props: Partial<React.ComponentProps<typeof QuizDetailsPageUI>> = {},
) =>
  render(
    <MemoryRouter>
      <QuizDetailsPageUI
        quiz={makeQuiz()}
        isLoadingQuiz={false}
        isHostGameLoading={false}
        isDeleteQuizLoading={false}
        onHostGame={() => undefined}
        onEditQuiz={() => undefined}
        onDeleteQuiz={() => undefined}
        {...props}
      />
    </MemoryRouter>,
  )

describe('QuizDetailsPageUI', () => {
  it('renders loading state when quiz is missing', () => {
    const { container } = renderUI({ quiz: undefined, isLoadingQuiz: false })

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders loading state when isLoadingQuiz is true', () => {
    const { container } = renderUI({ quiz: makeQuiz(), isLoadingQuiz: true })

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders quiz details (snapshot)', () => {
    const { container } = renderUI()

    expect(
      screen.getByText('The Ultimate Geography Challenge'),
    ).toBeInTheDocument()
    expect(screen.getByText(/14 Questions/i)).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('does not render owner actions when isOwner is false', () => {
    renderUI({ isOwner: false })

    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Edit' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Host Game' }),
    ).toBeInTheDocument()
  })

  it('renders owner actions when isOwner is true', () => {
    renderUI({ isOwner: true })

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })

  it('renders description only when present', () => {
    renderUI({ quiz: makeQuiz({ description: undefined }) })

    expect(
      screen.queryByText(/Test your knowledge of world capitals/i),
    ).not.toBeInTheDocument()
  })

  it('renders image only when imageCoverURL is present', () => {
    renderUI({ quiz: makeQuiz({ imageCoverURL: undefined }) })

    expect(screen.queryByTestId('responsive-image')).not.toBeInTheDocument()
  })

  it('renders singular Question when numberOfQuestions is 1', () => {
    renderUI({ quiz: makeQuiz({ numberOfQuestions: 1 }) })

    expect(screen.getByText('1 Question')).toBeInTheDocument()
  })

  it('renders author name or N/A when missing', () => {
    renderUI({ quiz: makeQuiz({ author: { id: 'a', name: '' } }) })

    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('opens and closes Host Game confirm dialog; confirm triggers onHostGame', () => {
    const onHostGame = vi.fn()
    renderUI({ onHostGame })

    fireEvent.click(screen.getByRole('button', { name: 'Host Game' }))
    expect(screen.getByTestId('confirm-dialog-Host Game')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'confirm' }))
    expect(onHostGame).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'close' }))
    expect(
      screen.queryByTestId('confirm-dialog-Host Game'),
    ).not.toBeInTheDocument()
  })

  it('opens Delete Quiz confirm dialog only for owners; confirm triggers onDeleteQuiz', () => {
    const onDeleteQuiz = vi.fn()
    renderUI({ isOwner: true, onDeleteQuiz })

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByTestId('confirm-dialog-Delete Quiz')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'confirm' }))
    expect(onDeleteQuiz).toHaveBeenCalledTimes(1)
  })

  it('edit button triggers onEditQuiz', () => {
    const onEditQuiz = vi.fn()
    renderUI({ isOwner: true, onEditQuiz })

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(onEditQuiz).toHaveBeenCalledTimes(1)
  })

  it('passes loading flags through to confirm dialogs', () => {
    renderUI({
      isOwner: true,
      isHostGameLoading: true,
      isDeleteQuizLoading: true,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Host Game' }))
    expect(screen.getByTestId('confirm-dialog-Host Game')).toHaveAttribute(
      'data-loading',
      'true',
    )

    fireEvent.click(screen.getByRole('button', { name: 'close' }))

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByTestId('confirm-dialog-Delete Quiz')).toHaveAttribute(
      'data-loading',
      'true',
    )
    expect(screen.getByTestId('confirm-dialog-Delete Quiz')).toHaveAttribute(
      'data-destructive',
      'true',
    )
  })
})
