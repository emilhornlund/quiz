import type { GameResultDto } from '@klurigo/common'
import { GameMode } from '@klurigo/common'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import QuestionSection from './QuestionSection'

const h = vi.hoisted(() => {
  return {
    getCorrectPercentage: vi.fn(() => 80),
    getAveragePrecision: vi.fn(() => 47),
    buildQuestionSectionMetricDetails: vi.fn(() => [
      { title: 'Correct', value: '8/10' },
      { title: 'Avg Time', value: '5.1s' },
    ]),
  }
})

vi.mock('../../utils', () => ({
  getCorrectPercentage: h.getCorrectPercentage,
  getAveragePrecision: h.getAveragePrecision,
  buildQuestionSectionMetricDetails: h.buildQuestionSectionMetricDetails,
}))

beforeEach(() => {
  h.getCorrectPercentage.mockClear()
  h.getAveragePrecision.mockClear()
  h.buildQuestionSectionMetricDetails.mockClear()
})

describe('QuestionSection', () => {
  it('renders rows with badges and question text for Classic and uses getCorrectPercentage', () => {
    const metrics = [
      { text: 'Q1: Capital of Sweden?' },
      { text: 'Q2: 2 + 2?' },
    ] as unknown as GameResultDto['questionMetrics']

    const { container } = render(
      <QuestionSection mode={GameMode.Classic} questionMetrics={metrics} />,
    )

    const rows = container.querySelectorAll('.tableRow')
    expect(rows.length).toBe(2)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Q1: Capital of Sweden?')).toBeInTheDocument()
    expect(screen.getByText('Q2: 2 + 2?')).toBeInTheDocument()

    expect(h.getCorrectPercentage).toHaveBeenCalledTimes(2)
    expect(h.getAveragePrecision).not.toHaveBeenCalled()
    expect(h.buildQuestionSectionMetricDetails).toHaveBeenCalledTimes(2)
    expect(h.buildQuestionSectionMetricDetails).toHaveBeenNthCalledWith(
      1,
      GameMode.Classic,
      metrics[0],
    )
    expect(h.buildQuestionSectionMetricDetails).toHaveBeenNthCalledWith(
      2,
      GameMode.Classic,
      metrics[1],
    )

    expect(container).toMatchSnapshot()
  })

  it('toggles details on row click and shows detail items', () => {
    const metrics = [
      { text: 'Q1: Capital of Sweden?' },
    ] as unknown as GameResultDto['questionMetrics']

    const { container } = render(
      <QuestionSection mode={GameMode.Classic} questionMetrics={metrics} />,
    )

    const row = container.querySelector('.tableRow') as HTMLElement
    const details = row.querySelector('.details') as HTMLElement
    expect(details.className).not.toContain('active')

    fireEvent.click(row)
    expect(details.className).toContain('active')
    expect(screen.getByText('Correct')).toBeInTheDocument()
    expect(screen.getByText('8/10')).toBeInTheDocument()
    expect(screen.getByText('Avg Time')).toBeInTheDocument()
    expect(screen.getByText('5.1s')).toBeInTheDocument()

    fireEvent.click(row)
    expect(details.className).not.toContain('active')

    expect(container).toMatchSnapshot()
  })

  it('renders rows for ZeroToOneHundred and uses getAveragePrecision', () => {
    const metrics = [
      { text: 'Q1: Estimate the distance' },
      { text: 'Q2: Estimate the height' },
      { text: 'Q3: Estimate the weight' },
    ] as unknown as GameResultDto['questionMetrics']

    const { container } = render(
      <QuestionSection
        mode={GameMode.ZeroToOneHundred}
        questionMetrics={metrics}
      />,
    )

    const rows = container.querySelectorAll('.tableRow')
    expect(rows.length).toBe(3)
    expect(screen.getByText('Q1: Estimate the distance')).toBeInTheDocument()
    expect(screen.getByText('Q2: Estimate the height')).toBeInTheDocument()
    expect(screen.getByText('Q3: Estimate the weight')).toBeInTheDocument()

    expect(h.getAveragePrecision).toHaveBeenCalledTimes(3)
    expect(h.getCorrectPercentage).not.toHaveBeenCalled()
    expect(h.buildQuestionSectionMetricDetails).toHaveBeenCalledTimes(3)
    expect(h.buildQuestionSectionMetricDetails).toHaveBeenNthCalledWith(
      1,
      GameMode.ZeroToOneHundred,
      metrics[0],
    )

    expect(container).toMatchSnapshot()
  })
})
