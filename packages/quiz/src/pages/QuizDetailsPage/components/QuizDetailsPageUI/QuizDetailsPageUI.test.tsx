import {
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import QuizDetailsPageUI from './QuizDetailsPageUI'

const created = new Date('2025-02-14T15:31:14.000Z')
const updated = new Date('2025-03-08T15:31:14.000Z')

describe('QuizDetailsPageUI', () => {
  it('should render QuizDetailsPageUI', async () => {
    const { container } = render(
      <MemoryRouter>
        <QuizDetailsPageUI
          quiz={{
            id: 'd12cf443-3fa9-4a0e-8778-d9c182903146',
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
            author: {
              id: 'db8d4c90-bfc2-4c2e-93cc-8f1c7eda34ec',
              name: 'FrostyBear',
            },
            created,
            updated,
          }}
          isLoadingQuiz={false}
          isHostGameLoading={false}
          isDeleteQuizLoading={false}
          onHostGame={() => undefined}
          onEditQuiz={() => undefined}
          onDeleteQuiz={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
