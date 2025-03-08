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

import { Player } from '../../../../models'

import ProfilePageUI from './ProfilePageUI'

const updated = new Date('2025-02-14T15:31:14.000Z')

const player: Player = {
  id: uuidv4(),
  nickname: 'FrostyBear',
}

describe('ProfilePageUI', () => {
  it('should render ProfilePageUI', async () => {
    const { container } = render(
      <MemoryRouter>
        <ProfilePageUI
          player={player}
          quizzes={[
            {
              id: 'ceb07743-7b14-4049-9569-2f30f90126c3',
              title: 'The Ultimate Geography Challenge',
              description:
                'Test your knowledge of world capitals, landmarks, and continents in this fun and educational geography quiz.',
              mode: GameMode.Classic,
              visibility: QuizVisibility.Public,
              category: QuizCategory.GeneralKnowledge,
              imageCoverURL: 'https://wallpaperaccess.com/full/157316.jpg',
              languageCode: LanguageCode.English,
              numberOfQuestions: 14,
              author: { id: player.id, name: 'FrostyBear' },
              created: new Date(),
              updated,
            },
            {
              id: '9864a1d4-6a65-4ab4-a90b-93a7288b3f11',
              title: 'Pop Culture Trivia',
              description:
                'How well do you know movies, music, and celebrity gossip? Find out with this entertaining pop culture quiz.',
              mode: GameMode.ZeroToOneHundred,
              visibility: QuizVisibility.Private,
              category: QuizCategory.GeneralKnowledge,
              languageCode: LanguageCode.English,
              numberOfQuestions: 20,
              author: { id: player.id, name: 'FrostyBear' },
              created: new Date(),
              updated,
            },
            {
              id: 'f55bca4d-9c6c-4df9-8e35-b99a74ee5439',
              title: 'History Through the Ages',
              description:
                'Explore key moments in history, from ancient civilizations to modern events, and see how much you remember.',
              mode: GameMode.Classic,
              visibility: QuizVisibility.Public,
              category: QuizCategory.GeneralKnowledge,
              languageCode: LanguageCode.English,
              numberOfQuestions: 16,
              author: { id: player.id, name: 'FrostyBear' },
              created: new Date(),
              updated,
            },
            {
              id: '6327dca4-8930-46de-9bbf-e406c3fe60e0',
              title: 'Science Facts and Myths',
              description:
                'Separate fact from fiction as you answer questions about physics, biology, chemistry, and other scientific wonders.',
              mode: GameMode.ZeroToOneHundred,
              visibility: QuizVisibility.Private,
              category: QuizCategory.GeneralKnowledge,
              languageCode: LanguageCode.English,
              numberOfQuestions: 28,
              author: { id: player.id, name: 'FrostyBear' },
              created: new Date(),
              updated,
            },
            {
              id: 'e539fe62-4c8a-4d6e-8826-bfbab2c9b483',
              title: 'Literary Legends',
              description:
                'Dive into the world of books, famous authors, and classic stories in this quiz for literature enthusiasts.',
              mode: GameMode.Classic,
              visibility: QuizVisibility.Public,
              category: QuizCategory.GeneralKnowledge,
              languageCode: LanguageCode.English,
              numberOfQuestions: 24,
              author: { id: player.id, name: 'FrostyBear' },
              created: new Date(),
              updated,
            },
          ]}
          pagination={{ total: 10, limit: 5, offset: 0 }}
          isLoading={false}
          isError={false}
          onNicknameChange={() => undefined}
          onChangeSearchParams={() => undefined}
          onCreateQuiz={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
