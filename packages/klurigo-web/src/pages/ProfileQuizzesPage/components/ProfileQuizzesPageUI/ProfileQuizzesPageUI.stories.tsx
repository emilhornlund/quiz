import {
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizVisibility,
} from '@klurigo/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { v4 as uuidv4 } from 'uuid'

import { withMockAuth } from '../../../../../.storybook/mockAuthContext.tsx'

import ProfileQuizzesPageUI from './ProfileQuizzesPageUI'

const meta = {
  title: 'Pages/ProfileQuizzesPage',
  component: ProfileQuizzesPageUI,
  decorators: [withRouter, withMockAuth],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ProfileQuizzesPageUI>

export default meta
type Story = StoryObj<typeof meta>

const authorId = uuidv4()

export const Default = {
  args: {
    quizzes: [
      {
        id: uuidv4(),
        title: 'The Ultimate Geography Challenge',
        description:
          'Test your knowledge of world capitals, landmarks, and continents in this fun and educational geography quiz.',
        mode: GameMode.Classic,
        visibility: QuizVisibility.Public,
        category: QuizCategory.GeneralKnowledge,
        imageCoverURL: 'https://wallpaperaccess.com/full/157316.jpg',
        languageCode: LanguageCode.English,
        numberOfQuestions: 14,
        author: { id: authorId, name: 'FrostyBear' },
        created: new Date(),
        updated: new Date(),
      },
      {
        id: uuidv4(),
        title: 'Pop Culture Trivia',
        description:
          'How well do you know movies, music, and celebrity gossip? Find out with this entertaining pop culture quiz.',
        mode: GameMode.ZeroToOneHundred,
        visibility: QuizVisibility.Private,
        category: QuizCategory.GeneralKnowledge,
        languageCode: LanguageCode.English,
        numberOfQuestions: 20,
        author: { id: authorId, name: 'FrostyBear' },
        created: new Date(),
        updated: new Date(),
      },
      {
        id: uuidv4(),
        title: 'History Through the Ages',
        description:
          'Explore key moments in history, from ancient civilizations to modern events, and see how much you remember.',
        mode: GameMode.Classic,
        visibility: QuizVisibility.Public,
        category: QuizCategory.GeneralKnowledge,
        languageCode: LanguageCode.English,
        numberOfQuestions: 16,
        author: { id: authorId, name: 'FrostyBear' },
        created: new Date(),
        updated: new Date(),
      },
      {
        id: uuidv4(),
        title: 'Science Facts and Myths',
        description:
          'Separate fact from fiction as you answer questions about physics, biology, chemistry, and other scientific wonders.',
        mode: GameMode.ZeroToOneHundred,
        visibility: QuizVisibility.Private,
        category: QuizCategory.GeneralKnowledge,
        languageCode: LanguageCode.English,
        numberOfQuestions: 28,
        author: { id: authorId, name: 'FrostyBear' },
        created: new Date(),
        updated: new Date(),
      },
      {
        id: uuidv4(),
        title: 'Literary Legends',
        description:
          'Dive into the world of books, famous authors, and classic stories in this quiz for literature enthusiasts.',
        mode: GameMode.Classic,
        visibility: QuizVisibility.Public,
        category: QuizCategory.GeneralKnowledge,
        languageCode: LanguageCode.English,
        numberOfQuestions: 24,
        author: { id: authorId, name: 'FrostyBear' },
        created: new Date(),
        updated: new Date(),
      },
    ],
    filter: {},
    pagination: { total: 10, limit: 5, offset: 0 },
    isLoading: false,
    isError: false,
    onChangeSearchParams: () => undefined,
    onCreateQuiz: () => undefined,
  },
} satisfies Story
