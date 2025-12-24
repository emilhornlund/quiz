import { QuestionType } from '@quiz/common'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import QuestionAnswerPicker from './QuestionAnswerPicker'

describe('QuestionAnswerPicker', () => {
  it('renders MultiChoice and maps selected index to onChange payload', () => {
    const onChange = vi.fn()
    const { container } = render(
      <QuestionAnswerPicker
        onChange={onChange}
        question={{
          type: QuestionType.MultiChoice,
          question: 'Which?',
          answers: [{ value: 'Alpha' }, { value: 'Beta' }, { value: 'Gamma' }],
          duration: 20,
        }}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Beta' }))
    expect(onChange).toHaveBeenCalledWith({
      type: QuestionType.MultiChoice,
      optionIndex: 1,
    })
    expect(container).toMatchSnapshot()
  })

  it('renders TrueFalse and maps index to boolean value', () => {
    const onChange = vi.fn()
    render(
      <QuestionAnswerPicker
        onChange={onChange}
        question={{
          type: QuestionType.TrueFalse,
          question: 'TF?',
          duration: 15,
        }}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'True' }))
    expect(onChange).toHaveBeenCalledWith({
      type: QuestionType.TrueFalse,
      value: true,
    })

    fireEvent.click(screen.getByRole('button', { name: 'False' }))
    expect(onChange).toHaveBeenLastCalledWith({
      type: QuestionType.TrueFalse,
      value: false,
    })
  })

  it('renders Range and forwards numeric value from slider submit', () => {
    const onChange = vi.fn()
    const { container } = render(
      <QuestionAnswerPicker
        onChange={onChange}
        question={{
          type: QuestionType.Range,
          question: 'Pick a number',
          min: 0,
          max: 100,
          step: 5,
          duration: 30,
        }}
      />,
    )

    const slider = screen.getByRole('slider') as HTMLInputElement
    fireEvent.change(slider, { target: { value: '25' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(onChange).toHaveBeenCalledWith({
      type: QuestionType.Range,
      value: 25,
    })
    expect(container).toMatchSnapshot()
  })

  it('renders TypeAnswer and forwards typed value on submit', () => {
    const onChange = vi.fn()
    const { container } = render(
      <QuestionAnswerPicker
        onChange={onChange}
        question={{
          type: QuestionType.TypeAnswer,
          question: 'Type it',
          duration: 25,
        }}
      />,
    )

    const input = screen.getByPlaceholderText('Answer')
    fireEvent.change(input, { target: { value: 'typed-value' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(onChange).toHaveBeenCalledWith({
      type: QuestionType.TypeAnswer,
      value: 'typed-value',
    })
    expect(container).toMatchSnapshot()
  })

  it('renders Pin and maps coordinates on submit', () => {
    const onChange = vi.fn()
    const { container } = render(
      <QuestionAnswerPicker
        onChange={onChange}
        question={{
          type: QuestionType.Pin,
          question: 'Drop a pin',
          imageURL: '/map.png',
          duration: 20,
        }}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /submit my pin/i }))

    expect(onChange).toHaveBeenCalledWith({
      type: QuestionType.Pin,
      positionX: expect.any(Number),
      positionY: expect.any(Number),
    })
    expect(container).toMatchSnapshot()
  })

  it('renders Puzzle and forwards values on submit without reordering', () => {
    const onChange = vi.fn()
    const { container } = render(
      <QuestionAnswerPicker
        onChange={onChange}
        question={{
          type: QuestionType.Puzzle,
          question: 'Order them',
          values: ['A', 'B', 'C'],
          duration: 40,
        }}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /submit my answer/i }))
    expect(onChange).toHaveBeenCalledWith({
      type: QuestionType.Puzzle,
      values: ['A', 'B', 'C'],
    })
    expect(container).toMatchSnapshot()
  })

  it('propagates interactive=false to children (e.g., disables multi-choice buttons)', () => {
    render(
      <QuestionAnswerPicker
        interactive={false}
        question={{
          type: QuestionType.MultiChoice,
          question: 'Disabled?',
          answers: [{ value: 'X' }, { value: 'Y' }],
          duration: 10,
        }}
      />,
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons.every((b) => (b as HTMLButtonElement).disabled)).toBe(true)
  })
})
