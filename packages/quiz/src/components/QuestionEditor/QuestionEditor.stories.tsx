import { GameMode } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

import {
  DEFAULT_CLASSIC_MODE_QUESTIONS,
  DEFAULT_ZERO_TO_ONE_HUNDRED_MODE_QUESTIONS,
} from '../../utils/questions-template.ts'

import QuestionEditor, { QuestionEditorProps } from './QuestionEditor'

const meta = {
  component: QuestionEditor,
  render: (props) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 32px)',
        flex: '1',
      }}>
      <QuestionEditor {...props} />
    </div>
  ),
} satisfies Meta<typeof QuestionEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Classic = {
  args: {
    mode: GameMode.Classic,
    questions: DEFAULT_CLASSIC_MODE_QUESTIONS,
    onChange: (() => {}) as QuestionEditorProps['onChange'],
    onValid: () => undefined,
  },
} satisfies Story

export const ZeroToOneHundred = {
  args: {
    mode: GameMode.ZeroToOneHundred,
    questions: DEFAULT_ZERO_TO_ONE_HUNDRED_MODE_QUESTIONS,
    onChange: (() => {}) as QuestionEditorProps['onChange'],
    onValid: () => undefined,
  },
} satisfies Story
