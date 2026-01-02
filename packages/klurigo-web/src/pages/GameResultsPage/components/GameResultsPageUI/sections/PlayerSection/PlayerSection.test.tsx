import type { GameResultDto } from '@klurigo/common'
import { GameMode } from '@klurigo/common'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import PlayerSection from './PlayerSection'

const h = vi.hoisted(() => {
  return {
    getCorrectPercentage: vi.fn(() => 75),
    getAveragePrecision: vi.fn(() => 42),
    buildPlayerSectionMetricDetails: vi.fn(() => [
      { title: 'Correct', value: '8/10' },
      { title: 'Fastest', value: '3.2s' },
    ]),
  }
})

vi.mock('../../utils', () => ({
  getCorrectPercentage: h.getCorrectPercentage,
  getAveragePrecision: h.getAveragePrecision,
  buildPlayerSectionMetricDetails: h.buildPlayerSectionMetricDetails,
}))

beforeEach(() => {
  h.getCorrectPercentage.mockClear()
  h.getAveragePrecision.mockClear()
  h.buildPlayerSectionMetricDetails.mockClear()
})

function buildMetrics(ranks: number[]): GameResultDto['playerMetrics'] {
  return ranks.map((rank) => ({
    rank,
    player: { id: `p-${rank}`, nickname: `Player ${rank}` },
  })) as unknown as GameResultDto['playerMetrics']
}

describe('PlayerSection', () => {
  it('renders rows with badges and nicknames for Classic mode and uses getCorrectPercentage', () => {
    const metrics = [
      { rank: 1, player: { nickname: 'Alice' } },
      { rank: 2, player: { nickname: 'Bob' } },
    ] as unknown as GameResultDto['playerMetrics']

    const { container } = render(
      <PlayerSection
        mode={GameMode.Classic}
        playerMetrics={metrics}
        currentParticipantId="participant-id"
      />,
    )

    const rows = container.querySelectorAll('.tableRow')
    expect(rows.length).toBe(2)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()

    expect(h.getCorrectPercentage).toHaveBeenCalledTimes(2)
    expect(h.getAveragePrecision).not.toHaveBeenCalled()
    expect(h.buildPlayerSectionMetricDetails).toHaveBeenCalledTimes(2)
    expect(h.buildPlayerSectionMetricDetails).toHaveBeenNthCalledWith(
      1,
      GameMode.Classic,
      metrics[0],
    )
    expect(h.buildPlayerSectionMetricDetails).toHaveBeenNthCalledWith(
      2,
      GameMode.Classic,
      metrics[1],
    )

    expect(container).toMatchSnapshot()
  })

  it('toggles details for a row and shows detail items for Classic mode', () => {
    const metrics = [
      { rank: 1, player: { nickname: 'Alice' } },
    ] as unknown as GameResultDto['playerMetrics']

    const { container } = render(
      <PlayerSection
        mode={GameMode.Classic}
        playerMetrics={metrics}
        currentParticipantId="participant-id"
      />,
    )
    const row = container.querySelector('.tableRow') as HTMLElement
    const details = row.querySelector('.details') as HTMLElement
    expect(details.className).not.toContain('active')

    fireEvent.click(row)
    expect(details.className).toContain('active')
    expect(screen.getByText('Correct')).toBeInTheDocument()
    expect(screen.getByText('8/10')).toBeInTheDocument()
    expect(screen.getByText('Fastest')).toBeInTheDocument()
    expect(screen.getByText('3.2s')).toBeInTheDocument()

    fireEvent.click(row)
    expect(details.className).not.toContain('active')

    expect(container).toMatchSnapshot()
  })

  it('renders rows for ZeroToOneHundred mode and uses getAveragePrecision', () => {
    const metrics = [
      { rank: 1, player: { nickname: 'Carol' } },
      { rank: 2, player: { nickname: 'Dave' } },
      { rank: 3, player: { nickname: 'Eve' } },
    ] as unknown as GameResultDto['playerMetrics']

    const { container } = render(
      <PlayerSection
        mode={GameMode.ZeroToOneHundred}
        playerMetrics={metrics}
        currentParticipantId="participant-id"
      />,
    )

    const rows = container.querySelectorAll('.tableRow')
    expect(rows.length).toBe(3)
    expect(screen.getByText('Carol')).toBeInTheDocument()
    expect(screen.getByText('Dave')).toBeInTheDocument()
    expect(screen.getByText('Eve')).toBeInTheDocument()

    expect(h.getAveragePrecision).toHaveBeenCalledTimes(3)
    expect(h.getCorrectPercentage).not.toHaveBeenCalled()
    expect(h.buildPlayerSectionMetricDetails).toHaveBeenCalledTimes(3)
    expect(h.buildPlayerSectionMetricDetails).toHaveBeenNthCalledWith(
      1,
      GameMode.ZeroToOneHundred,
      metrics[0],
    )

    expect(container).toMatchSnapshot()
  })

  it('inserts a separator for rank gaps and a trailing separator when length >= 5 (e.g., 1..5, 7)', () => {
    const metrics = buildMetrics([1, 2, 3, 4, 5, 7])

    const { container } = render(
      <PlayerSection
        mode={GameMode.Classic}
        playerMetrics={metrics}
        currentParticipantId="participant-id"
      />,
    )

    const rows = container.querySelectorAll('.tableRow')
    const seps = container.querySelectorAll('.tableSeparator')
    expect(rows.length).toBe(6) // 1..5,7
    expect(seps.length).toBe(2) // one for gap (5->7) + trailing

    // Verify order: r,r,r,r,r,sep,r,sep
    const sequence = Array.from(
      container.querySelectorAll('.tableRow, .tableSeparator'),
    ).map((el) => (el.classList.contains('tableRow') ? 'row' : 'sep'))
    expect(sequence).toEqual([
      'row',
      'row',
      'row',
      'row',
      'row',
      'sep',
      'row',
      'sep',
    ])
  })

  it('adds only a trailing separator when exactly top 5 (e.g., 1..5)', () => {
    const metrics = buildMetrics([1, 2, 3, 4, 5])

    const { container } = render(
      <PlayerSection
        mode={GameMode.Classic}
        playerMetrics={metrics}
        currentParticipantId="participant-id"
      />,
    )

    const rows = container.querySelectorAll('.tableRow')
    const seps = container.querySelectorAll('.tableSeparator')
    expect(rows.length).toBe(5)
    expect(seps.length).toBe(1)

    // Last element should be the separator
    const all = Array.from(
      container.querySelectorAll('.tableRow, .tableSeparator'),
    )
    expect(all.length).toBeGreaterThan(0)
    const last = all[all.length - 1]
    expect(last.classList.contains('tableSeparator')).toBe(true)
  })

  it('adds trailing separator when no gaps and >= 6 rows (e.g., 1..6)', () => {
    const metrics = buildMetrics([1, 2, 3, 4, 5, 6])

    const { container } = render(
      <PlayerSection
        mode={GameMode.Classic}
        playerMetrics={metrics}
        currentParticipantId="participant-id"
      />,
    )

    const rows = container.querySelectorAll('.tableRow')
    const seps = container.querySelectorAll('.tableSeparator')
    expect(rows.length).toBe(6)
    expect(seps.length).toBe(1)
  })

  it('renders no trailing separator when fewer than 5 rows (e.g., 1..4)', () => {
    const metrics = buildMetrics([1, 2, 3, 4])

    const { container } = render(
      <PlayerSection
        mode={GameMode.Classic}
        playerMetrics={metrics}
        currentParticipantId="participant-id"
      />,
    )

    const rows = container.querySelectorAll('.tableRow')
    const seps = container.querySelectorAll('.tableSeparator')
    expect(rows.length).toBe(4)
    expect(seps.length).toBe(0)
  })
})
