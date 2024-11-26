import { GameEventType, MediaType, QuestionType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'

import HostQuestionState from './HostQuestionState'

const meta = {
  component: HostQuestionState,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HostQuestionState>

export default meta
type Story = StoryObj<typeof meta>

export const QuestionMultiTwoAnswers = {
  args: {
    event: {
      type: GameEventType.GameQuestionHost,
      game: {
        pin: '123456',
      },
      question: {
        type: QuestionType.MultiChoice,
        question: 'Who painted The Starry Night?',
        media: {
          type: MediaType.Image,
          url: 'https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg',
        },
        answers: [{ value: 'Vincent van Gogh' }, { value: 'Pablo Picasso' }],
        duration: 30,
      },
      countdown: {
        expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
      submissions: { current: 3, total: 10 },
      pagination: { current: 1, total: 20 },
    },
    onSkip: () => undefined,
  },
} satisfies Story

export const QuestionMultiFourAnswers = {
  args: {
    event: {
      type: GameEventType.GameQuestionHost,
      game: {
        pin: '123456',
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
        expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
      submissions: { current: 3, total: 10 },
      pagination: { current: 1, total: 20 },
    },
    onSkip: () => undefined,
  },
} satisfies Story

export const QuestionMultiSixAnswers = {
  args: {
    event: {
      type: GameEventType.GameQuestionHost,
      game: {
        pin: '123456',
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
        expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
      submissions: { current: 3, total: 10 },
      pagination: { current: 1, total: 20 },
    },
    onSkip: () => undefined,
  },
} satisfies Story

export const QuestionSlider = {
  args: {
    event: {
      type: GameEventType.GameQuestionHost,
      game: {
        pin: '123456',
      },
      question: {
        type: QuestionType.Range,
        question: "What percentage of the earth's surface is covered by water?",
        media: {
          type: MediaType.Video,
          url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
        },
        min: 0,
        max: 100,
        step: 1,
        duration: 30,
      },
      countdown: {
        expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
      submissions: { current: 3, total: 10 },
      pagination: { current: 1, total: 20 },
    },
    onSkip: () => undefined,
  },
} satisfies Story

export const QuestionTrueFalse = {
  args: {
    event: {
      type: GameEventType.GameQuestionHost,
      game: {
        pin: '123456',
      },
      question: {
        type: QuestionType.TrueFalse,
        question: "Rabbits can't vomit?",
        duration: 30,
      },
      countdown: {
        expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
      submissions: { current: 3, total: 10 },
      pagination: { current: 1, total: 20 },
    },
    onSkip: () => undefined,
  },
} satisfies Story

export const QuestionTypeAnswer = {
  args: {
    event: {
      type: GameEventType.GameQuestionHost,
      game: {
        pin: '123456',
      },
      question: {
        type: QuestionType.TypeAnswer,
        question: 'Who painted the Mono Lisa?',
        duration: 30,
      },
      countdown: {
        expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
      submissions: { current: 3, total: 10 },
      pagination: { current: 1, total: 20 },
    },
    onSkip: () => undefined,
  },
} satisfies Story
