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

import QuizDiscoverPageUI from './QuizDiscoverPageUI'

const PlayerID = uuidv4()

const updated = new Date('2025-02-14T15:31:14.000Z')

describe('QuizDiscoverPageUI', () => {
  it('should render QuizDiscoverPageUI', async () => {
    const { container } = render(
      <MemoryRouter>
        <QuizDiscoverPageUI
          results={[
            {
              id: '66e89e5d-4e27-4864-8020-790428f94d0e',
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
              id: '59d4f710-a451-45c7-8fa9-91e1abda506a',
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
              id: '085726dd-f6f4-4984-baed-6225b11f4164',
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
              id: 'bd07a122-bcc3-4298-94c3-b5375169615d',
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
              id: 'ec05918c-be05-495d-b122-0f6576e25388',
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
          filter={{}}
          pagination={{ total: 10, limit: 5, offset: 0 }}
          isLoading={false}
          isError={false}
          onChangeSearchParams={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
