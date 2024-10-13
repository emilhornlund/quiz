import { GameEventQuestionType, GameEventType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'

import PlayerQuestionState from './PlayerQuestionState'

const meta = {
  component: PlayerQuestionState,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PlayerQuestionState>

export default meta
type Story = StoryObj<typeof meta>

export const QuestionMultiTwoAnswers = {
  args: {
    event: {
      type: GameEventType.GameQuestionPlayer,
      nickname: 'FrostyBear',
      question: {
        type: GameEventQuestionType.Multi,
        question: 'Who painted The Starry Night?',
        imageURL:
          'https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg',
        answers: [{ value: 'Vincent van Gogh' }, { value: 'Pablo Picasso' }],
        duration: 30,
      },
      time: 20,
      score: { total: 10458 },
      pagination: { current: 1, total: 20 },
    },
  },
} satisfies Story

export const QuestionMultiFourAnswers = {
  args: {
    event: {
      type: GameEventType.GameQuestionPlayer,
      nickname: 'FrostyBear',
      question: {
        type: GameEventQuestionType.Multi,
        question: 'Who painted The Starry Night?',
        imageURL: 'https://wallpapercave.com/wp/wp2824407.jpg',
        answers: [
          { value: 'Vincent van Gogh' },
          { value: 'Pablo Picasso' },
          { value: 'Leonardo da Vinci' },
          { value: 'Claude Monet' },
        ],
        duration: 30,
      },
      time: 20,
      score: { total: 10458 },
      pagination: { current: 1, total: 20 },
    },
  },
} satisfies Story

export const QuestionMultiSixAnswers = {
  args: {
    event: {
      type: GameEventType.GameQuestionPlayer,
      nickname: 'FrostyBear',
      question: {
        type: GameEventQuestionType.Multi,
        question: 'Who painted The Starry Night?',
        imageURL: 'https://wallpaperaccess.com/full/157316.jpg',
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
      time: 20,
      score: { total: 10458 },
      pagination: { current: 1, total: 20 },
    },
  },
} satisfies Story

export const QuestionSlider = {
  args: {
    event: {
      type: GameEventType.GameQuestionPlayer,
      nickname: 'FrostyBear',
      question: {
        type: GameEventQuestionType.Slider,
        question: "What percentage of the earth's surface is covered by water?",
        min: 0,
        max: 100,
        step: 1,
        duration: 30,
      },
      time: 20,
      score: { total: 10458 },
      pagination: { current: 1, total: 20 },
    },
  },
} satisfies Story

export const QuestionTrueFalse = {
  args: {
    event: {
      type: GameEventType.GameQuestionPlayer,
      nickname: 'FrostyBear',
      question: {
        type: GameEventQuestionType.TrueFalse,
        question: "Rabbits can't vomit?",
        duration: 30,
      },
      time: 20,
      score: { total: 10458 },
      pagination: { current: 1, total: 20 },
    },
  },
} satisfies Story

export const QuestionTypeAnswer = {
  args: {
    event: {
      type: GameEventType.GameQuestionPlayer,
      nickname: 'FrostyBear',
      question: {
        type: GameEventQuestionType.TypeAnswer,
        question: 'Who painted the Mono Lisa?',
        duration: 30,
      },
      time: 20,
      score: { total: 10458 },
      pagination: { current: 1, total: 20 },
    },
  },
} satisfies Story
