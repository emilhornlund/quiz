import { GameEventType, QuestionPinTolerance, QuestionType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import HostResultState from './HostResultState'

const meta = {
  component: HostResultState,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HostResultState>

export default meta
type Story = StoryObj<typeof meta>

export const QuestionMultiTwoAnswers = {
  args: {
    event: {
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
          { value: 'Vincent van Gogh', count: 3, correct: true, index: 0 },
          { value: 'Pablo Picasso', count: 7, correct: false, index: 0 },
        ],
      },
      pagination: {
        current: 1,
        total: 20,
      },
    },
  },
} satisfies Story

export const QuestionMultiFourAnswers = {
  args: {
    event: {
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
          { value: 'Vincent van Gogh', count: 3, correct: true, index: 0 },
          { value: 'Pablo Picasso', count: 2, correct: false, index: 0 },
          { value: 'Leonardo da Vinci', count: 0, correct: false, index: 0 },
          { value: 'Claude Monet', count: 5, correct: false, index: 0 },
        ],
      },
      pagination: {
        current: 1,
        total: 20,
      },
    },
  },
} satisfies Story

export const QuestionMultiSixAnswers = {
  args: {
    event: {
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
          { value: 'Vincent van Gogh', count: 1, correct: true, index: 0 },
          { value: 'Pablo Picasso', count: 2, correct: false, index: 0 },
          { value: 'Leonardo da Vinci', count: 4, correct: false, index: 0 },
          { value: 'Claude Monet', count: 0, correct: false, index: 0 },
          { value: 'Michelangelo', count: 0, correct: false, index: 0 },
          { value: 'Rembrandt', count: 3, correct: false, index: 0 },
        ],
      },
      pagination: {
        current: 1,
        total: 20,
      },
    },
  },
} satisfies Story

export const QuestionSlider = {
  args: {
    event: {
      type: GameEventType.GameResultHost,
      game: {
        pin: '123456',
      },
      question: {
        type: QuestionType.Range,
        question: "What percentage of the earth's surface is covered by water?",
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
    },
  },
} satisfies Story

export const QuestionTrueFalse = {
  args: {
    event: {
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
    },
  },
} satisfies Story

export const QuestionTypeAnswer = {
  args: {
    event: {
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
    },
  },
} satisfies Story

export const QuestionPin = {
  name: 'Question Pin',
  args: {
    event: {
      type: GameEventType.GameResultHost,
      game: {
        pin: '123456',
      },
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
      pagination: {
        current: 1,
        total: 20,
      },
    },
  },
} satisfies Story

export const QuestionPuzzle = {
  name: 'Question Puzzle',
  args: {
    event: {
      type: GameEventType.GameResultHost,
      game: {
        pin: '123456',
      },
      question: {
        type: QuestionType.Puzzle,
        question: 'Sort these planets from closest to farthest from the Sun',
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
      pagination: {
        current: 1,
        total: 20,
      },
    },
  },
} satisfies Story
