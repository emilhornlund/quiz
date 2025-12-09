import { render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Podium from './Podium'

describe('Podium', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render Podium from a full leaderboard', async () => {
    const { container } = render(
      <Podium
        values={[
          { position: 1, nickname: 'ShadowCyborg', score: 18456 },
          { position: 2, nickname: 'Radar', score: 18398 },
          { position: 3, nickname: 'ShadowWhirlwind', score: 15492 },
          { position: 4, nickname: 'WhiskerFox', score: 14118 },
          { position: 5, nickname: 'JollyNimbus', score: 13463 },
          { position: 6, nickname: 'PuddingPop', score: 12459 },
          { position: 7, nickname: 'MysticPine', score: 11086 },
          { position: 8, nickname: 'FrostyBear', score: 10361 },
          { position: 9, nickname: 'Willo', score: 9360 },
          { position: 10, nickname: 'ScarletFlame', score: 6723 },
        ]}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render Podium from a leaderboard with 3 players', async () => {
    const mockValues = [
      { position: 1, nickname: 'ShadowCyborg', score: 18456 },
      { position: 2, nickname: 'Radar', score: 18398 },
      { position: 3, nickname: 'ShadowWhirlwind', score: 15492 },
    ]

    const { container } = render(<Podium values={mockValues} />)

    expect(screen.getByText('ShadowCyborg')).toBeInTheDocument()
    expect(screen.getByText('Radar')).toBeInTheDocument()
    expect(screen.getByText('ShadowWhirlwind')).toBeInTheDocument()

    expect(screen.getByText('18456')).toBeInTheDocument()
    expect(screen.getByText('18398')).toBeInTheDocument()
    expect(screen.getByText('15492')).toBeInTheDocument()

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  it('should render Podium from a leaderboard with 2 players', async () => {
    const { container } = render(
      <Podium
        values={[
          { position: 1, nickname: 'ShadowCyborg', score: 18456 },
          { position: 2, nickname: 'Radar', score: 18398 },
        ]}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render Podium from a leaderboard with 1 player', async () => {
    const { container } = render(
      <Podium
        values={[{ position: 1, nickname: 'ShadowCyborg', score: 18456 }]}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
