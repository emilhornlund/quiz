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

import ProfileQuizzes from './ProfileQuizzes'

const PlayerID = uuidv4()

const updated = new Date('2025-02-14T15:31:14.000Z')

describe('ProfileQuizzes', () => {
  it('should render ProfileQuizzes', async () => {
    const { container } = render(
      <MemoryRouter>
        <ProfileQuizzes
          quizzes={[
            {
              id: 'e314f952-6480-4fef-9553-4df0527800d4',
              title: 'The Ultimate Geography Challenge',
              description:
                'Test your knowledge of world capitals, landmarks, and continents in this fun and educational geography quiz.',
              mode: GameMode.Classic,
              visibility: QuizVisibility.Public,
              category: QuizCategory.GeneralKnowledge,
              imageCoverURL: 'https://wallpaperaccess.com/full/157316.jpg',
              languageCode: LanguageCode.English,
              numberOfQuestions: 14,
              author: { id: PlayerID, name: 'FrostyBear' },
              created: new Date(),
              updated,
            },
            {
              id: 'a1acbaff-8d97-45b2-89a3-906ff8aa8d88',
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
              id: 'fc71c63b-4dd5-4813-9106-abeeaba60c08',
              title: 'History Through the Ages',
              description:
                'Explore key moments in history, from ancient civilizations to modern events, and see how much you remember.',
              mode: GameMode.Classic,
              visibility: QuizVisibility.Public,
              category: QuizCategory.GeneralKnowledge,
              languageCode: LanguageCode.English,
              numberOfQuestions: 16,
              author: { id: PlayerID, name: 'FrostyBear' },
              created: new Date(),
              updated,
            },
            {
              id: 'bb3ca2ea-a8f4-4b74-95de-d90ea7e8de36',
              title: 'Science Facts and Myths',
              description:
                'Separate fact from fiction as you answer questions about physics, biology, chemistry, and other scientific wonders.',
              mode: GameMode.ZeroToOneHundred,
              visibility: QuizVisibility.Private,
              category: QuizCategory.GeneralKnowledge,
              languageCode: LanguageCode.English,
              numberOfQuestions: 28,
              author: { id: PlayerID, name: 'FrostyBear' },
              created: new Date(),
              updated,
            },
            {
              id: '02cd1f62-024b-4962-ba1b-0c7c12ab2b18',
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
          onCreateQuiz={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
