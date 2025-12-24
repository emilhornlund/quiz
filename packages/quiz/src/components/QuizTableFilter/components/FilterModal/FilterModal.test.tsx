import {
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import FilterModal from './FilterModal'

describe('FilterModal', () => {
  it('should render FilterModal', async () => {
    const { container } = render(
      <FilterModal
        filter={{
          visibility: QuizVisibility.Public,
          category: QuizCategory.GeneralKnowledge,
          languageCode: LanguageCode.English,
          mode: GameMode.Classic,
          sort: 'created',
          order: 'desc',
        }}
        onClose={() => undefined}
        onApply={() => undefined}
        showVisibilityFilter
        open
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
