import {
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { describe, expect, it } from 'vitest'

import ProfileQuizzesPageUI from './ProfileQuizzesPageUI'

const authorId = uuidv4()

describe('ProfileQuizzesPageUI', () => {
  it('should render ProfileQuizzesPageUI', async () => {
    const { container } = render(
      <MemoryRouter>
        <ProfileQuizzesPageUI
          quizzes={[
            {
              id: 'c2c3d5cc-63c0-4f70-8665-6dacbd1796f9',
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
              id: 'cb9e0c33-3f19-4b93-a976-acba28db8f82',
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
              id: '8b6323a1-21ab-467b-b0d2-b835d7831ba7',
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
              id: 'cc11c2f4-7d2d-4630-8780-d3e4e2dae743',
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
              id: 'c3550303-7f77-48bf-b114-e0d0c1152c0f',
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
          ]}
          filter={{}}
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
