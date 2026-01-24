import {
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizVisibility,
} from '@klurigo/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { v4 as uuidv4 } from 'uuid'

import { withMockAuth } from '../../../../../.storybook/mockAuthContext'

import QuizDetailsPageUI from './QuizDetailsPageUI'

const meta = {
  title: 'Pages/QuizDetailsPage',
  component: QuizDetailsPageUI,
  decorators: [withRouter, withMockAuth],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof QuizDetailsPageUI>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    quiz: {
      id: uuidv4(),
      title: 'The Ultimate Geography Challenge',
      description:
        'Test your knowledge of world capitals, landmarks, and continents in this fun and educational geography quiz.',
      mode: GameMode.Classic,
      visibility: QuizVisibility.Public,
      category: QuizCategory.GeneralKnowledge,
      imageCoverURL:
        'https://0utwqfl7.cdn.imgeng.in/explore-academics/programs/images/undergraduate/henson/geographymajorMH.jpg',
      languageCode: LanguageCode.English,
      numberOfQuestions: 14,
      author: { id: uuidv4(), name: 'FrostyBear' },
      ratingSummary: { stars: 4.6, comments: 13 },
      created: new Date(),
      updated: new Date(),
    },
    isOwner: true,
    isLoadingQuiz: false,
    isHostGameLoading: false,
    isDeleteQuizLoading: false,
    onHostGame: () => undefined,
    onEditQuiz: () => undefined,
    onDeleteQuiz: () => undefined,
  },
} satisfies Story
