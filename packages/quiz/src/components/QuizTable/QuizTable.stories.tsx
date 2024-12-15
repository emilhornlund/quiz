import { GameMode, LanguageCode, QuizVisibility } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import { v4 as uuidv4 } from 'uuid'

import QuizTable, { QuizTableItem } from './QuizTable'

const meta = {
  component: QuizTable,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof QuizTable>

export default meta
type Story = StoryObj<typeof meta>

const TableItems: QuizTableItem[] = [
  {
    id: uuidv4(),
    title: 'The Ultimate Geography Challenge',
    description:
      'Test your knowledge of world capitals, landmarks, and continents in this fun and educational geography quiz.',
    mode: GameMode.Classic,
    visibility: QuizVisibility.Public,
    imageCoverURL: 'https://wallpaperaccess.com/full/157316.jpg',
    languageCode: LanguageCode.English,
  },
  {
    id: uuidv4(),
    title: 'Pop Culture Trivia',
    description:
      'How well do you know movies, music, and celebrity gossip? Find out with this entertaining pop culture quiz.',
    mode: GameMode.ZeroToOneHundred,
    visibility: QuizVisibility.Private,
    languageCode: LanguageCode.English,
  },
  {
    id: uuidv4(),
    title: 'History Through the Ages',
    description:
      'Explore key moments in history, from ancient civilizations to modern events, and see how much you remember.',
    mode: GameMode.Classic,
    visibility: QuizVisibility.Public,
    languageCode: LanguageCode.English,
  },
  {
    id: uuidv4(),
    title: 'Science Facts and Myths',
    description:
      'Separate fact from fiction as you answer questions about physics, biology, chemistry, and other scientific wonders.',
    mode: GameMode.ZeroToOneHundred,
    visibility: QuizVisibility.Private,
    languageCode: LanguageCode.English,
  },
  {
    id: uuidv4(),
    title: 'Literary Legends',
    description:
      'Dive into the world of books, famous authors, and classic stories in this quiz for literature enthusiasts.',
    mode: GameMode.Classic,
    visibility: QuizVisibility.Public,
    languageCode: LanguageCode.English,
  },
]

export const Default = {
  args: {
    items: TableItems,
    pagination: { total: 10, limit: 5, offset: 0 },
  },
} satisfies Story
