import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import RatingCard from './RatingCard'

describe('RatingCard', () => {
  it('renders title and 5 star buttons', () => {
    render(
      <RatingCard
        canRateQuiz
        stars={undefined}
        comment={undefined}
        onRatingChange={vi.fn()}
        onCommentChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Rate this quiz')).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: /Rate \d star/ }),
    ).toHaveLength(5)
  })

  it('disables star buttons and shows disabled message when canRateQuiz is false', () => {
    render(
      <RatingCard
        canRateQuiz={false}
        stars={undefined}
        comment={undefined}
        onRatingChange={vi.fn()}
        onCommentChange={vi.fn()}
      />,
    )

    const buttons = screen.getAllByRole('button', { name: /Rate \d star/ })
    expect(buttons).toHaveLength(5)
    for (const btn of buttons) {
      expect(btn).toBeDisabled()
    }

    expect(
      screen.getByText('You cannot rate your own quiz'),
    ).toBeInTheDocument()
  })

  it('does not render comment textarea when stars is undefined', () => {
    render(
      <RatingCard
        canRateQuiz
        stars={undefined}
        comment={undefined}
        onRatingChange={vi.fn()}
        onCommentChange={vi.fn()}
      />,
    )

    expect(screen.queryByLabelText(/comment/i)).toBeNull()
    expect(screen.queryByPlaceholderText('Optional comment...')).toBeNull()
  })

  it('renders comment textarea when stars is set', () => {
    render(
      <RatingCard
        canRateQuiz
        stars={3}
        comment=""
        onRatingChange={vi.fn()}
        onCommentChange={vi.fn()}
      />,
    )

    expect(
      screen.getByPlaceholderText('Optional comment...'),
    ).toBeInTheDocument()
  })

  it('calls onRatingChange when clicking a star different from current rating', async () => {
    const user = userEvent.setup()
    const onRatingChange = vi.fn()

    render(
      <RatingCard
        canRateQuiz
        stars={2}
        comment=""
        onRatingChange={onRatingChange}
        onCommentChange={vi.fn()}
      />,
    )

    const buttons = screen.getAllByRole('button', { name: /Rate \d star/ })
    await user.click(buttons[3]) // 4 stars

    expect(onRatingChange).toHaveBeenCalledTimes(1)
    expect(onRatingChange).toHaveBeenCalledWith(4)
  })

  it('does not call onRatingChange when clicking the current star rating', async () => {
    const user = userEvent.setup()
    const onRatingChange = vi.fn()

    render(
      <RatingCard
        canRateQuiz
        stars={4}
        comment=""
        onRatingChange={onRatingChange}
        onCommentChange={vi.fn()}
      />,
    )

    const buttons = screen.getAllByRole('button', { name: /Rate \d star/ })
    await user.click(buttons[3]) // still 4 stars

    expect(onRatingChange).not.toHaveBeenCalled()
  })

  it('calls onCommentChange when typing in the textarea', async () => {
    const user = userEvent.setup()
    const onCommentChange = vi.fn()

    render(
      <RatingCard
        canRateQuiz
        stars={5}
        comment=""
        onRatingChange={vi.fn()}
        onCommentChange={onCommentChange}
      />,
    )

    const text = 'Nice quiz!'
    const textarea = screen.getByPlaceholderText('Optional comment...')
    await user.type(textarea, text)

    expect(onCommentChange).toHaveBeenCalled()

    const emitted = onCommentChange.mock.calls.map(([value]) => value).join('')
    expect(emitted).toBe(text)
  })

  it('does not call onRatingChange when canRateQuiz is false', async () => {
    const user = userEvent.setup()
    const onRatingChange = vi.fn()

    render(
      <RatingCard
        canRateQuiz={false}
        stars={undefined}
        comment={undefined}
        onRatingChange={onRatingChange}
        onCommentChange={vi.fn()}
      />,
    )

    const buttons = screen.getAllByRole('button', { name: /Rate \d star/ })
    await user.click(buttons[0])

    expect(onRatingChange).not.toHaveBeenCalled()
  })
})
