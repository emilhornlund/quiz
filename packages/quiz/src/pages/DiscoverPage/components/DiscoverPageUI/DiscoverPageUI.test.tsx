import {
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { describe, expect, it } from 'vitest'

import DiscoverPageUI from './DiscoverPageUI'

const PlayerID = uuidv4()

const updated = new Date('2025-02-14T15:31:14.000Z')

describe('DiscoverPageUI', () => {
  it('should render DiscoverPageUI', async () => {
    const { container } = render(
      <MemoryRouter>
        <DiscoverPageUI
          playerId={PlayerID}
          results={[
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
              author: { id: uuidv4(), name: 'FrostyBear' },
              created: new Date(),
              updated,
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
              author: { id: PlayerID, name: 'FrostyBear' },
              created: new Date(),
              updated,
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
              author: { id: uuidv4(), name: 'FrostyBear' },
              created: new Date(),
              updated,
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
              author: { id: uuidv4(), name: 'FrostyBear' },
              created: new Date(),
              updated,
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
              author: { id: PlayerID, name: 'FrostyBear' },
              created: new Date(),
              updated,
            },
          ]}
          pagination={{ total: 10, limit: 5, offset: 0 }}
          isLoading={false}
          isError={false}
          onChangeSearchParams={() => undefined}
          onEditQuiz={() => undefined}
          onHostGame={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
