import { GameEventType, MediaType, QuestionType } from '@quiz/common'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  completeTask: vi.fn<[], Promise<void>>().mockResolvedValue(),
}))

vi.mock('../../context/game', () => ({
  useGameContext: () => ({
    completeTask: h.completeTask,
  }),
}))

import HostQuestionState from './HostQuestionState'

const now = Date.now()

describe('HostQuestionState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(now))
    h.completeTask.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render HostQuestionState with question type multi-choice and two answers', async () => {
    const { container } = render(
      <MemoryRouter>
        <HostQuestionState
          event={{
            type: GameEventType.GameQuestionHost,
            game: { pin: '123456' },
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
            submissions: { current: 3, total: 10 },
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )
    expect(container).toMatchSnapshot()
  })

  it('should render HostQuestionState with question type multi-choice and four answers', async () => {
    const { container } = render(
      <MemoryRouter>
        <HostQuestionState
          event={{
            type: GameEventType.GameQuestionHost,
            game: { pin: '123456' },
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
            submissions: { current: 3, total: 10 },
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )
    expect(container).toMatchSnapshot()
  })

  it('should render HostQuestionState with question type multi-choice and six answers', async () => {
    const { container } = render(
      <MemoryRouter>
        <HostQuestionState
          event={{
            type: GameEventType.GameQuestionHost,
            game: { pin: '123456' },
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
            submissions: { current: 3, total: 10 },
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )
    expect(container).toMatchSnapshot()
  })

  it('should render HostQuestionState with question type range', async () => {
    const { container } = render(
      <MemoryRouter>
        <HostQuestionState
          event={{
            type: GameEventType.GameQuestionHost,
            game: { pin: '123456' },
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
            submissions: { current: 3, total: 10 },
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )
    expect(container).toMatchSnapshot()
  })

  it('should render HostQuestionState with question type true false', async () => {
    const { container } = render(
      <MemoryRouter>
        <HostQuestionState
          event={{
            type: GameEventType.GameQuestionHost,
            game: { pin: '123456' },
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
            submissions: { current: 3, total: 10 },
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )
    expect(container).toMatchSnapshot()
  })

  it('should render HostQuestionState with question type type answer', async () => {
    const { container } = render(
      <MemoryRouter>
        <HostQuestionState
          event={{
            type: GameEventType.GameQuestionHost,
            game: { pin: '123456' },
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
            submissions: { current: 3, total: 10 },
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )
    expect(container).toMatchSnapshot()
  })

  it('renders with audio media', () => {
    const { container } = render(
      <MemoryRouter>
        <HostQuestionState
          event={{
            type: GameEventType.GameQuestionHost,
            game: { pin: '999999' },
            question: {
              type: QuestionType.TrueFalse,
              question: 'Audio clip question?',
              media: {
                type: MediaType.Audio,
                url: 'https://cdn.test/audio.mp3',
              },
              duration: 15,
            },
            countdown: {
              initiatedTime: new Date(now).toISOString(),
              expiryTime: new Date(now + 15 * 1000).toISOString(),
              serverTime: new Date(now).toISOString(),
            },
            submissions: { current: 1, total: 5 },
            pagination: { current: 2, total: 10 },
          }}
        />
      </MemoryRouter>,
    )
    expect(container).toMatchSnapshot()
  })

  it('renders with video media', () => {
    const { container } = render(
      <MemoryRouter>
        <HostQuestionState
          event={{
            type: GameEventType.GameQuestionHost,
            game: { pin: '999999' },
            question: {
              type: QuestionType.TrueFalse,
              question: 'Video clip question?',
              media: {
                type: MediaType.Video,
                url: 'https://cdn.test/video.mp4',
              },
              duration: 15,
            },
            countdown: {
              initiatedTime: new Date(now).toISOString(),
              expiryTime: new Date(now + 15 * 1000).toISOString(),
              serverTime: new Date(now).toISOString(),
            },
            submissions: { current: 1, total: 5 },
            pagination: { current: 2, total: 10 },
          }}
        />
      </MemoryRouter>,
    )
    expect(container).toMatchSnapshot()
  })

  it('does not render media when question type is Pin (even if media provided)', () => {
    const { container } = render(
      <MemoryRouter>
        <HostQuestionState
          event={{
            type: GameEventType.GameQuestionHost,
            game: { pin: '000111' },
            question: {
              type: QuestionType.Pin,
              question: 'Place the pin on the map',
              /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
              /* @ts-ignore */
              media: { type: MediaType.Image, url: 'https://cdn.test/map.png' },
              duration: 20,
            },
            countdown: {
              initiatedTime: new Date(now).toISOString(),
              expiryTime: new Date(now + 20 * 1000).toISOString(),
              serverTime: new Date(now).toISOString(),
            },
            submissions: { current: 0, total: 10 },
            pagination: { current: 3, total: 10 },
          }}
        />
      </MemoryRouter>,
    )
    expect(container).toMatchSnapshot()
  })

  it('clicks Skip and calls completeTask', () => {
    const { container } = render(
      <MemoryRouter>
        <HostQuestionState
          event={{
            type: GameEventType.GameQuestionHost,
            game: { pin: '123456' },
            question: {
              type: QuestionType.TrueFalse,
              question: 'Skip me?',
              duration: 30,
            },
            countdown: {
              initiatedTime: new Date(now).toISOString(),
              expiryTime: new Date(now + 30 * 1000).toISOString(),
              serverTime: new Date(now).toISOString(),
            },
            submissions: { current: 2, total: 4 },
            pagination: { current: 1, total: 2 },
          }}
        />
      </MemoryRouter>,
    )
    const skip = container.querySelector('#skip-button') as HTMLButtonElement
    fireEvent.click(skip)
    expect(h.completeTask).toHaveBeenCalledTimes(1)
    expect(container).toMatchSnapshot()
  })

  it('shows submissions counter', () => {
    render(
      <MemoryRouter>
        <HostQuestionState
          event={{
            type: GameEventType.GameQuestionHost,
            game: { pin: '123456' },
            question: {
              type: QuestionType.TrueFalse,
              question: 'Counter?',
              duration: 30,
            },
            countdown: {
              initiatedTime: new Date(now).toISOString(),
              expiryTime: new Date(now + 30 * 1000).toISOString(),
              serverTime: new Date(now).toISOString(),
            },
            submissions: { current: 7, total: 12 },
            pagination: { current: 1, total: 2 },
          }}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText(/7 \/ 12/)).toBeInTheDocument()
  })
})
