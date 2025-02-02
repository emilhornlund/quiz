import { GameMode, LanguageCode, QuizVisibility } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import FilterModal from './FilterModal'

describe('FilterModal', () => {
  it('should render FilterModal', async () => {
    const { container } = render(
      <FilterModal
        visibility={QuizVisibility.Public}
        languageCode={LanguageCode.English}
        mode={GameMode.Classic}
        sort="created"
        order="desc"
        onClose={() => undefined}
        onApply={() => undefined}
        showVisibilityFilter
        open
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
