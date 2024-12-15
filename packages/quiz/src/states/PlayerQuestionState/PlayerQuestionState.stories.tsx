import { GameEventType, MediaType, QuestionType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import PlayerQuestionState from './PlayerQuestionState'

const meta = {
  component: PlayerQuestionState,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PlayerQuestionState>

export default meta
type Story = StoryObj<typeof meta>

export const QuestionMultiChoiceTwoAnswers = {
  args: {
    event: {
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
        answers: [{ value: 'Vincent van Gogh' }, { value: 'Pablo Picasso' }],
        duration: 30,
      },
      countdown: {
        expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
      pagination: { current: 1, total: 20 },
    },
    onSubmitQuestionAnswer: () => undefined,
  },
} satisfies Story

export const QuestionMultiChoiceFourAnswers = {
  args: {
    event: {
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
        expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
      pagination: { current: 1, total: 20 },
    },
    onSubmitQuestionAnswer: () => undefined,
  },
} satisfies Story

export const QuestionMultiChoiceSixAnswers = {
  args: {
    event: {
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
        expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
      pagination: { current: 1, total: 20 },
    },
    onSubmitQuestionAnswer: () => undefined,
  },
} satisfies Story

export const QuestionSlider = {
  args: {
    event: {
      type: GameEventType.GameQuestionPlayer,
      player: {
        nickname: 'FrostyBear',
        score: { total: 10458 },
      },
      question: {
        type: QuestionType.Range,
        question: "What percentage of the earth's surface is covered by water?",
        min: 0,
        max: 100,
        step: 1,
        duration: 30,
      },
      countdown: {
        expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
      pagination: { current: 1, total: 20 },
    },
    onSubmitQuestionAnswer: () => undefined,
  },
} satisfies Story

export const QuestionTrueFalse = {
  args: {
    event: {
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
        expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
      pagination: { current: 1, total: 20 },
    },
    onSubmitQuestionAnswer: () => undefined,
  },
} satisfies Story

export const QuestionTypeAnswer = {
  args: {
    event: {
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
        expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
      pagination: { current: 1, total: 20 },
    },
    onSubmitQuestionAnswer: () => undefined,
  },
} satisfies Story
