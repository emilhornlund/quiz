import {
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

import {
  DEFAULT_CLASSIC_MODE_QUESTIONS,
  DEFAULT_ZERO_TO_ONE_HUNDRED_MODE_QUESTIONS,
} from '../../utils/questions-template.ts'

import QuizEditor from './QuizEditor'

const meta = {
  component: QuizEditor,
  render: (props) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 32px)',
        flex: '1',
      }}>
      <QuizEditor {...props} />
    </div>
  ),
} satisfies Meta<typeof QuizEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Classic = {
  args: {
    quiz: {
      title: 'My Classic Quiz',
      mode: GameMode.Classic,
      visibility: QuizVisibility.Private,
      category: QuizCategory.GeneralKnowledge,
      languageCode: LanguageCode.English,
      questions: DEFAULT_CLASSIC_MODE_QUESTIONS,
    },
    onChange: () => undefined,
    onValid: () => undefined,
  },
} satisfies Story

export const ZeroToOneHundred = {
  args: {
    quiz: {
      title: 'My ZeroToOneHundred Quiz',
      mode: GameMode.ZeroToOneHundred,
      visibility: QuizVisibility.Private,
      category: QuizCategory.GeneralKnowledge,
      languageCode: LanguageCode.English,
      questions: DEFAULT_ZERO_TO_ONE_HUNDRED_MODE_QUESTIONS,
    },
    onChange: () => undefined,
    onValid: () => undefined,
  },
} satisfies Story
