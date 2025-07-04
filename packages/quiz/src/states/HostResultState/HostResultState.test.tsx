import { GameEventType, QuestionType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import HostResultState from './HostResultState'

describe('HostResultState', () => {
  it('should render HostResultState with question type multi-choice and two answers', () => {
    const { container } = render(
      <MemoryRouter>
        <HostResultState
          event={{
            type: GameEventType.GameResultHost,
            game: {
              pin: '123456',
            },
            question: {
              type: QuestionType.MultiChoice,
              question: 'Who painted The Starry Night?',
            },
            results: {
              type: QuestionType.MultiChoice,
              distribution: [
                {
                  value: 'Vincent van Gogh',
                  count: 3,
                  correct: true,
                  index: 0,
                },
                { value: 'Pablo Picasso', count: 7, correct: false, index: 0 },
              ],
            },
            pagination: {
              current: 1,
              total: 20,
            },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render HostResultState with question type multi-choice and four answers', () => {
    const { container } = render(
      <MemoryRouter>
        <HostResultState
          event={{
            type: GameEventType.GameResultHost,
            game: {
              pin: '123456',
            },
            question: {
              type: QuestionType.MultiChoice,
              question: 'Who painted The Starry Night?',
            },
            results: {
              type: QuestionType.MultiChoice,
              distribution: [
                {
                  value: 'Vincent van Gogh',
                  count: 3,
                  correct: true,
                  index: 0,
                },
                { value: 'Pablo Picasso', count: 2, correct: false, index: 0 },
                {
                  value: 'Leonardo da Vinci',
                  count: 0,
                  correct: false,
                  index: 0,
                },
                { value: 'Claude Monet', count: 5, correct: false, index: 0 },
              ],
            },
            pagination: {
              current: 1,
              total: 20,
            },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render HostResultState with question type multi-choice and six answers', () => {
    const { container } = render(
      <MemoryRouter>
        <HostResultState
          event={{
            type: GameEventType.GameResultHost,
            game: {
              pin: '123456',
            },
            question: {
              type: QuestionType.MultiChoice,
              question: 'Who painted The Starry Night?',
            },
            results: {
              type: QuestionType.MultiChoice,
              distribution: [
                {
                  value: 'Vincent van Gogh',
                  count: 1,
                  correct: true,
                  index: 0,
                },
                { value: 'Pablo Picasso', count: 2, correct: false, index: 0 },
                {
                  value: 'Leonardo da Vinci',
                  count: 4,
                  correct: false,
                  index: 0,
                },
                { value: 'Claude Monet', count: 0, correct: false, index: 0 },
                { value: 'Michelangelo', count: 0, correct: false, index: 0 },
                { value: 'Rembrandt', count: 3, correct: false, index: 0 },
              ],
            },
            pagination: {
              current: 1,
              total: 20,
            },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render HostResultState with question type range', () => {
    const { container } = render(
      <MemoryRouter>
        <HostResultState
          event={{
            type: GameEventType.GameResultHost,
            game: {
              pin: '123456',
            },
            question: {
              type: QuestionType.Range,
              question:
                "What percentage of the earth's surface is covered by water?",
            },
            results: {
              type: QuestionType.Range,
              distribution: [
                { value: 59, count: 1, correct: false },
                { value: 61, count: 1, correct: false },
                { value: 64, count: 1, correct: false },
                { value: 65, count: 1, correct: false },
                { value: 71, count: 2, correct: true },
                { value: 72, count: 1, correct: false },
                { value: 73, count: 1, correct: false },
                { value: 79, count: 1, correct: false },
                { value: 83, count: 1, correct: false },
              ],
            },
            pagination: {
              current: 1,
              total: 20,
            },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render HostResultState with question type true false', () => {
    const { container } = render(
      <MemoryRouter>
        <HostResultState
          event={{
            type: GameEventType.GameResultHost,
            game: {
              pin: '123456',
            },
            question: {
              type: QuestionType.TrueFalse,
              question: "Rabbits can't vomit?",
            },
            results: {
              type: QuestionType.TrueFalse,
              distribution: [
                { value: true, count: 4, correct: true },
                { value: false, count: 6, correct: false },
              ],
            },
            pagination: {
              current: 1,
              total: 20,
            },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render HostResultState with question type type answer', () => {
    const { container } = render(
      <MemoryRouter>
        <HostResultState
          event={{
            type: GameEventType.GameResultHost,
            game: {
              pin: '123456',
            },
            question: {
              type: QuestionType.TypeAnswer,
              question: 'Who painted the Mono Lisa?',
            },
            results: {
              type: QuestionType.TypeAnswer,
              distribution: [
                { value: 'leonardo da vinci', count: 2, correct: true },
                { value: 'leonardo', count: 4, correct: false },
                { value: 'picasso', count: 3, correct: false },
                { value: 'rembrandt', count: 1, correct: false },
              ],
            },
            pagination: {
              current: 1,
              total: 20,
            },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
