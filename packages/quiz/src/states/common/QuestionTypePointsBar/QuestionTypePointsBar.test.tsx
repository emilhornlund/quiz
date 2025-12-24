import { GameMode, QuestionType } from '@quiz/common'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import QuestionTypePointsBar from './QuestionTypePointsBar'

describe('QuestionTypePointsBar', () => {
  it('renders null for non-classic mode', () => {
    const { container } = render(
      <QuestionTypePointsBar
        mode={GameMode.ZeroToOneHundred}
        questionType={QuestionType.Range}
        questionPoints={1000}
      />,
    )
    expect(screen.queryByText(/points/i)).toBeNull()
    expect(container).toMatchSnapshot()
  })

  it('renders question type label and zero points', () => {
    const { container } = render(
      <QuestionTypePointsBar
        mode={GameMode.Classic}
        questionType={QuestionType.MultiChoice}
        questionPoints={0}
      />,
    )
    expect(screen.getByText('Multi Choice')).toBeInTheDocument()
    expect(screen.getByText('Zero Points')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders standard points for 1000', () => {
    const { container } = render(
      <QuestionTypePointsBar
        mode={GameMode.Classic}
        questionType={QuestionType.TrueFalse}
        questionPoints={1000}
      />,
    )
    expect(screen.getByText('True or False')).toBeInTheDocument()
    expect(screen.getByText('Standard Points')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders double points for 2000', () => {
    const { container } = render(
      <QuestionTypePointsBar
        mode={GameMode.Classic}
        questionType={QuestionType.Range}
        questionPoints={2000}
      />,
    )
    expect(screen.getByText('Range')).toBeInTheDocument()
    expect(screen.getByText('Double Points')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders only question type label when points are undefined', () => {
    const { container } = render(
      <QuestionTypePointsBar
        mode={GameMode.Classic}
        questionType={QuestionType.TypeAnswer}
      />,
    )
    expect(screen.getByText('Type Answer')).toBeInTheDocument()
    expect(screen.queryByText('Zero Points')).toBeNull()
    expect(screen.queryByText('Standard Points')).toBeNull()
    expect(screen.queryByText('Double Points')).toBeNull()
    expect(container).toMatchSnapshot()
  })
})
