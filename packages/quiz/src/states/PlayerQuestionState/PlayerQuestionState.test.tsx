import { GameEventType, MediaType, QuestionType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import PlayerQuestionState from './PlayerQuestionState'

const now = Date.now()

describe('PlayerQuestionState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(now))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render PlayerQuestionState with question type multi-choice and two answers', () => {
    const { container } = render(
      <MemoryRouter>
        <PlayerQuestionState
          event={{
            type: GameEventType.GameQuestionPlayer,
            player: {
              nickname: 'FrostyBear',
              score: { total: 10458 },
            },
            question: {
              type: QuestionType.MultiChoice,
              question: 'Who painted The Starry Night?',
              media: {
                type: MediaType.Image,
                url: 'https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg',
              },
              answers: [
                { value: 'Vincent van Gogh' },
                { value: 'Pablo Picasso' },
              ],
              duration: 30,
            },
            countdown: {
              initiatedTime: new Date(now).toISOString(),
              expiryTime: new Date(now + 60 * 1000).toISOString(),
              serverTime: new Date(now).toISOString(),
            },
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render PlayerQuestionState with question type multi-choice and four answers', () => {
    const { container } = render(
      <MemoryRouter>
        <PlayerQuestionState
          event={{
            type: GameEventType.GameQuestionPlayer,
            player: {
              nickname: 'FrostyBear',
              score: { total: 10458 },
            },
            question: {
              type: QuestionType.MultiChoice,
              question: 'Who painted The Starry Night?',
              media: {
                type: MediaType.Image,
                url: 'https://wallpapercave.com/wp/wp2824407.jpg',
              },
              answers: [
                { value: 'Vincent van Gogh' },
                { value: 'Pablo Picasso' },
                { value: 'Leonardo da Vinci' },
                { value: 'Claude Monet' },
              ],
              duration: 30,
            },
            countdown: {
              initiatedTime: new Date(now).toISOString(),
              expiryTime: new Date(now + 60 * 1000).toISOString(),
              serverTime: new Date(now).toISOString(),
            },
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render PlayerQuestionState with question type multi-choice and six answers', () => {
    const { container } = render(
      <MemoryRouter>
        <PlayerQuestionState
          event={{
            type: GameEventType.GameQuestionPlayer,
            player: {
              nickname: 'FrostyBear',
              score: { total: 10458 },
            },
            question: {
              type: QuestionType.MultiChoice,
              question: 'Who painted The Starry Night?',
              media: {
                type: MediaType.Image,
                url: 'https://wallpaperaccess.com/full/157316.jpg',
              },
              answers: [
                { value: 'Vincent van Gogh' },
                { value: 'Pablo Picasso' },
                { value: 'Leonardo da Vinci' },
                { value: 'Claude Monet' },
                { value: 'Michelangelo' },
                { value: 'Rembrandt' },
              ],
              duration: 30,
            },
            countdown: {
              initiatedTime: new Date(now).toISOString(),
              expiryTime: new Date(now + 60 * 1000).toISOString(),
              serverTime: new Date(now).toISOString(),
            },
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render PlayerQuestionState with question type range', () => {
    const { container } = render(
      <MemoryRouter>
        <PlayerQuestionState
          event={{
            type: GameEventType.GameQuestionPlayer,
            player: {
              nickname: 'FrostyBear',
              score: { total: 10458 },
            },
            question: {
              type: QuestionType.Range,
              question:
                "What percentage of the earth's surface is covered by water?",
              min: 0,
              max: 100,
              step: 1,
              duration: 30,
            },
            countdown: {
              initiatedTime: new Date(now).toISOString(),
              expiryTime: new Date(now + 60 * 1000).toISOString(),
              serverTime: new Date(now).toISOString(),
            },
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render PlayerQuestionState with question type true false', () => {
    const { container } = render(
      <MemoryRouter>
        <PlayerQuestionState
          event={{
            type: GameEventType.GameQuestionPlayer,
            player: {
              nickname: 'FrostyBear',
              score: { total: 10458 },
            },
            question: {
              type: QuestionType.TrueFalse,
              question: "Rabbits can't vomit?",
              duration: 30,
            },
            countdown: {
              initiatedTime: new Date(now).toISOString(),
              expiryTime: new Date(now + 60 * 1000).toISOString(),
              serverTime: new Date(now).toISOString(),
            },
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render PlayerQuestionState with question type type answer', () => {
    const { container } = render(
      <MemoryRouter>
        <PlayerQuestionState
          event={{
            type: GameEventType.GameQuestionPlayer,
            player: {
              nickname: 'FrostyBear',
              score: { total: 10458 },
            },
            question: {
              type: QuestionType.TypeAnswer,
              question: 'Who painted the Mono Lisa?',
              duration: 30,
            },
            countdown: {
              initiatedTime: new Date(now).toISOString(),
              expiryTime: new Date(now + 60 * 1000).toISOString(),
              serverTime: new Date(now).toISOString(),
            },
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
