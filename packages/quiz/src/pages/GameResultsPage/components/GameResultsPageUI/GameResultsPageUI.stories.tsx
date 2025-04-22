import { GameMode, QuestionType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { v4 as uuidv4 } from 'uuid'

import GameResultsPageUI from './GameResultsPageUI'

const meta = {
  title: 'Pages/GameResultsPage',
  component: GameResultsPageUI,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof GameResultsPageUI>

export default meta
type Story = StoryObj<typeof meta>

export const Classic = {
  args: {
    results: {
      id: uuidv4(),
      mode: GameMode.Classic,
      name: 'Classic Quiz Debug',
      host: { id: uuidv4(), nickname: 'FrostyBear' },
      playerMetrics: [
        {
          player: { id: uuidv4(), nickname: 'ShadowCyborg' },
          rank: 1,
          correct: 4,
          incorrect: 0,
          unanswered: 0,
          averageResponseTime: 1961,
          longestCorrectStreak: 4,
          score: 3891,
        },
        {
          player: { id: uuidv4(), nickname: 'ShadowWhirlwind' },
          rank: 2,
          correct: 3,
          incorrect: 1,
          unanswered: 0,
          averageResponseTime: 5127,
          longestCorrectStreak: 2,
          score: 2742,
        },
        {
          player: { id: uuidv4(), nickname: 'WhiskerFox' },
          rank: 3,
          correct: 1,
          incorrect: 1,
          unanswered: 2,
          averageResponseTime: 16999,
          longestCorrectStreak: 1,
          score: 948,
        },
      ],
      questionMetrics: [
        {
          text: 'What is the capital of Sweden?',
          type: QuestionType.MultiChoice,
          correct: 3,
          incorrect: 0,
          unanswered: 0,
          averageResponseTime: 2085,
        },
        {
          text: 'Guess the temperature of the hottest day ever recorded.',
          type: QuestionType.Range,
          correct: 1,
          incorrect: 1,
          unanswered: 1,
          averageResponseTime: 12252,
        },
        {
          text: 'The earth is flat.',
          type: QuestionType.TrueFalse,
          correct: 2,
          incorrect: 1,
          unanswered: 0,
          averageResponseTime: 2869,
        },
        {
          text: 'What is the capital of Denmark?',
          type: QuestionType.TypeAnswer,
          correct: 2,
          incorrect: 0,
          unanswered: 1,
          averageResponseTime: 14910,
        },
      ],
      duration: 456,
      created: new Date(),
    },
  },
} satisfies Story

export const ZeroToOneHundred = {
  args: {
    results: {
      id: uuidv4(),
      mode: GameMode.ZeroToOneHundred,
      name: '0-100 Quiz Debug',
      host: { id: uuidv4(), nickname: 'FrostyBear' },
      playerMetrics: [
        {
          player: { id: uuidv4(), nickname: 'ShadowCyborg' },
          rank: 1,
          averagePrecision: 1,
          unanswered: 0,
          averageResponseTime: 4015,
          longestCorrectStreak: 4,
          score: -40,
        },
        {
          player: { id: uuidv4(), nickname: 'ShadowWhirlwind' },
          rank: 2,
          averagePrecision: 0.95,
          unanswered: 0,
          averageResponseTime: 10662,
          longestCorrectStreak: 1,
          score: 10,
        },
        {
          player: { id: uuidv4(), nickname: 'WhiskerFox' },
          rank: 3,
          averagePrecision: 0.72,
          unanswered: 1,
          averageResponseTime: 27251,
          longestCorrectStreak: 0,
          score: 113,
        },
      ],
      questionMetrics: [
        {
          text: '2002 levererades den första Koenigseggbilen av modell CC8S. Hur många tillverkades totalt?',
          type: QuestionType.Range,
          averagePrecision: 0.98,
          unanswered: 0,
          averageResponseTime: 9428,
        },
        {
          text: 'Hur många år blev Kubas förre president Fidel Castro?',
          type: QuestionType.Range,
          averagePrecision: 0.92,
          unanswered: 0,
          averageResponseTime: 11464,
        },
        {
          text: 'Vilka är de två första decimalerna i talet pi?',
          type: QuestionType.Range,
          averagePrecision: 0.67,
          unanswered: 1,
          averageResponseTime: 25265,
        },
        {
          text: 'Hur många klädda kort finns det i en kortlek?',
          type: QuestionType.Range,
          averagePrecision: 0.99,
          unanswered: 0,
          averageResponseTime: 9748,
        },
      ],
      duration: 123.772,
      created: new Date(),
    },
  },
} satisfies Story
