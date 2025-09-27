import { GameEventType, QuestionPinTolerance, QuestionType } from '@quiz/common'
import { fireEvent, render, screen, within } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  completeTask: vi.fn<[], Promise<void>>().mockResolvedValue(),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  addCorrectAnswer: vi.fn<[], Promise<void>>().mockResolvedValue(),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  deleteCorrectAnswer: vi.fn<[], Promise<void>>().mockResolvedValue(),
}))

vi.mock('../../context/game', () => ({
  useGameContext: () => ({
    completeTask: h.completeTask,
    addCorrectAnswer: h.addCorrectAnswer,
    deleteCorrectAnswer: h.deleteCorrectAnswer,
  }),
}))

import HostResultState from './HostResultState'

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function findActionButtonForAnswer(answerText: string, actionWords: RegExp) {
  const byAria = screen.queryByRole('button', {
    name: new RegExp(`${actionWords.source}.*${escapeRe(answerText)}`, 'i'),
  })
  if (byAria) return byAria
  const node = screen.getByText(new RegExp(escapeRe(answerText), 'i'))
  const row =
    node.closest('[role="row"]') ??
    node.closest('li') ??
    node.closest('tr') ??
    node.closest('div') ??
    node.parentElement
  if (!row) return null
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const buttons = within(row).queryAllByRole('button')
  return buttons[0] ?? null
}

describe('HostResultState', () => {
  beforeEach(() => {
    h.completeTask.mockClear()
    h.addCorrectAnswer.mockClear()
    h.deleteCorrectAnswer.mockClear()
  })

  it('should render HostResultState with question type multi-choice and two answers', () => {
    const { container } = render(
      <MemoryRouter>
        <HostResultState
          event={{
            type: GameEventType.GameResultHost,
            game: { pin: '123456' },
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
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByText('Who painted The Starry Night?'),
    ).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('should render HostResultState with question type multi-choice and four answers', () => {
    const { container } = render(
      <MemoryRouter>
        <HostResultState
          event={{
            type: GameEventType.GameResultHost,
            game: { pin: '123456' },
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
            pagination: { current: 1, total: 20 },
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
            game: { pin: '123456' },
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
            pagination: { current: 1, total: 20 },
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
            game: { pin: '123456' },
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
            pagination: { current: 1, total: 20 },
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
            game: { pin: '123456' },
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
            pagination: { current: 1, total: 20 },
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
            game: { pin: '123456' },
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
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render HostResultState with question type pin', () => {
    const { container } = render(
      <MemoryRouter>
        <HostResultState
          event={{
            type: GameEventType.GameResultHost,
            game: { pin: '123456' },
            question: {
              type: QuestionType.Pin,
              question:
                'Where is the capital Stockholm located? Pin the answer on a map of Europe',
            },
            results: {
              type: QuestionType.Pin,
              imageURL:
                'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Europe_laea_location_map.svg/1401px-Europe_laea_location_map.svg.png',
              positionX: 0.45838,
              positionY: 0.35438,
              tolerance: QuestionPinTolerance.Medium,
              distribution: [
                { value: '0.42838,0.39438', count: 1, correct: true },
                { value: '0.68271,0.79206', count: 1, correct: false },
                { value: '0.59385,0.21256', count: 1, correct: false },
                { value: '0.60786,0.97867', count: 1, correct: false },
              ],
            },
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render HostResultState with question type puzzle', () => {
    const { container } = render(
      <MemoryRouter>
        <HostResultState
          event={{
            type: GameEventType.GameResultHost,
            game: { pin: '123456' },
            question: {
              type: QuestionType.Puzzle,
              question:
                'Sort these planets from closest to farthest from the Sun',
            },
            results: {
              type: QuestionType.Puzzle,
              values: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
              distribution: [
                {
                  value: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
                  count: 1,
                  correct: true,
                },
                {
                  value: ['Athens', 'Plovdiv', 'Argos', 'Lisbon'],
                  count: 2,
                  correct: false,
                },
                {
                  value: ['Athens', 'Lisbon', 'Argos', 'Plovdiv'],
                  count: 1,
                  correct: false,
                },
              ],
            },
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('clicks Next to initiate leaderboard task', () => {
    const { container } = render(
      <MemoryRouter>
        <HostResultState
          event={{
            type: GameEventType.GameResultHost,
            game: { pin: '999999' },
            question: { type: QuestionType.TrueFalse, question: 'Proceed?' },
            results: {
              type: QuestionType.TrueFalse,
              distribution: [
                { value: true, count: 1, correct: true },
                { value: false, count: 0, correct: false },
              ],
            },
            pagination: { current: 3, total: 5 },
          }}
        />
      </MemoryRouter>,
    )

    const next = container.querySelector('#next-button') as HTMLButtonElement
    fireEvent.click(next)
    expect(h.completeTask).toHaveBeenCalledTimes(1)
    expect(container).toMatchSnapshot()
  })
  it('marks an incorrect option as correct via QuestionResults UI', async () => {
    render(
      <MemoryRouter>
        <HostResultState
          event={{
            type: GameEventType.GameResultHost,
            game: { pin: '123456' },
            question: { type: QuestionType.MultiChoice, question: 'Q?' },
            results: {
              type: QuestionType.MultiChoice,
              distribution: [
                {
                  value: 'Vincent van Gogh',
                  count: 3,
                  correct: true,
                  index: 0,
                },
                { value: 'Pablo Picasso', count: 2, correct: false, index: 1 },
              ],
            },
            pagination: { current: 1, total: 2 },
          }}
        />
      </MemoryRouter>,
    )

    const btn = findActionButtonForAnswer(
      'Pablo Picasso',
      /(add|mark|set|correct)/i,
    )
    expect(btn).toBeTruthy()
    fireEvent.click(btn as HTMLButtonElement)

    expect(h.addCorrectAnswer).toHaveBeenCalledTimes(1)
    const arg = h.addCorrectAnswer.mock.calls[0][0]
    expect(arg).toBeTruthy()
  })

  it('removes an already-correct option via QuestionResults UI', async () => {
    render(
      <MemoryRouter>
        <HostResultState
          event={{
            type: GameEventType.GameResultHost,
            game: { pin: '123456' },
            question: { type: QuestionType.MultiChoice, question: 'Q?' },
            results: {
              type: QuestionType.MultiChoice,
              distribution: [
                {
                  value: 'Vincent van Gogh',
                  count: 3,
                  correct: true,
                  index: 0,
                },
                { value: 'Pablo Picasso', count: 2, correct: false, index: 1 },
              ],
            },
            pagination: { current: 1, total: 2 },
          }}
        />
      </MemoryRouter>,
    )

    const btn = findActionButtonForAnswer(
      'Vincent van Gogh',
      /(remove|unset|unmark|delete)/i,
    )
    expect(btn).toBeTruthy()
    fireEvent.click(btn as HTMLButtonElement)

    expect(h.deleteCorrectAnswer).toHaveBeenCalledTimes(1)
    const arg = h.deleteCorrectAnswer.mock.calls[0][0]
    expect(arg).toBeTruthy()
  })
})
