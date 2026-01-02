import { GameMode, type GameResultDto } from '@klurigo/common'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SummarySection from './SummarySection'

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

const createGameMock = vi.fn()
const authenticateGameMock = vi.fn()

vi.mock('../../../../../../api', () => ({
  useKlurigoServiceClient: () => ({
    createGame: createGameMock,
    authenticateGame: authenticateGameMock,
  }),
}))

const h = vi.hoisted(() => {
  return {
    getCorrectPercentage: vi.fn(),
    getAveragePrecision: vi.fn(),
    getQuizDifficultyMessage: vi.fn((p: number) => `Difficulty: ${p}%`),
    formatRoundedDuration: vi.fn((d: number) => `dur:${d}`),
    formatRoundedSeconds: vi.fn((s: number) => `sec:${s}`),
  }
})

vi.mock('../../utils', () => ({
  getCorrectPercentage: h.getCorrectPercentage,
  getAveragePrecision: h.getAveragePrecision,
  getQuizDifficultyMessage: h.getQuizDifficultyMessage,
  formatRoundedDuration: h.formatRoundedDuration,
  formatRoundedSeconds: h.formatRoundedSeconds,
}))

beforeEach(() => {
  createGameMock.mockReset()
  authenticateGameMock.mockReset()
  h.getCorrectPercentage.mockReset()
  h.getAveragePrecision.mockReset()
  h.getQuizDifficultyMessage.mockReset()
  h.formatRoundedDuration.mockReset()
  h.formatRoundedSeconds.mockReset()
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
})

afterEach(() => {
  vi.restoreAllMocks()
})

const CREATED_DATE = new Date('2025-01-01T12:00:00.000Z')

describe('SummarySection', () => {
  it('renders Classic summary, uses getCorrectPercentage, shows fastest and longest streak', () => {
    h.getCorrectPercentage
      .mockImplementationOnce(() => 60)
      .mockImplementationOnce(() => 80)
    const playerMetrics = [
      {
        rank: 1,
        score: 120,
        averageResponseTime: 3.2,
        longestCorrectStreak: 5,
        player: { nickname: 'Alice' },
      },
      {
        rank: 2,
        score: 90,
        averageResponseTime: 4.5,
        longestCorrectStreak: 7,
        player: { nickname: 'Bob' },
      },
    ] as unknown as GameResultDto['playerMetrics']
    const questionMetrics = [
      { text: 'Q1' },
      { text: 'Q2' },
    ] as unknown as GameResultDto['questionMetrics']

    const { container } = render(
      <SummarySection
        hostNickname="FrostyBear"
        mode={GameMode.Classic}
        quiz={{ id: 'quizId', canHostLiveGame: true }}
        numberOfPlayers={2}
        numberOfQuestions={2}
        playerMetrics={playerMetrics}
        questionMetrics={questionMetrics}
        duration={123}
        created={CREATED_DATE}
      />,
    )

    expect(h.getCorrectPercentage).toHaveBeenCalledTimes(2)
    expect(h.getAveragePrecision).not.toHaveBeenCalled()
    expect(h.getQuizDifficultyMessage).toHaveBeenCalledWith(70)
    expect(screen.getByText('Difficulty: 70%')).toBeInTheDocument()
    expect(h.formatRoundedDuration).toHaveBeenCalledWith(123)
    expect(screen.getByText('dur:123')).toBeInTheDocument()
    expect(screen.getByText('Fastest Overall Player')).toBeInTheDocument()
    expect(h.formatRoundedSeconds).toHaveBeenCalledWith(3.2)
    expect(screen.getByText('sec:3.2')).toBeInTheDocument()
    expect(screen.getByText('Longest Correct Streak')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()

    const detailsCard = container.querySelector('.card.details') as HTMLElement
    const titles = Array.from(detailsCard.querySelectorAll('.title'))
    const getValueFor = (label: string) => {
      const titleEl = titles.find(
        (el) => el.textContent === label,
      ) as HTMLElement
      return titleEl.nextElementSibling?.textContent
    }
    expect(getValueFor('Players')).toBe(String(playerMetrics.length))
    expect(getValueFor('Questions')).toBe(String(questionMetrics.length))

    const playAgainButton = screen.getByRole('button', { name: /play again/i })
    expect(playAgainButton).toBeEnabled()

    expect(container).toMatchSnapshot()
  })

  it('renders ZeroToOneHundred summary and uses getAveragePrecision', () => {
    h.getAveragePrecision
      .mockImplementationOnce(() => 33)
      .mockImplementationOnce(() => 67)
    const playerMetrics = [
      {
        rank: 1,
        score: 120,
        averageResponseTime: 2.1,
        longestCorrectStreak: 2,
        player: { nickname: 'Carol' },
      },
      {
        rank: 2,
        score: 90,
        averageResponseTime: 2.7,
        longestCorrectStreak: 3,
        player: { nickname: 'Dave' },
      },
    ] as unknown as GameResultDto['playerMetrics']
    const questionMetrics = [
      { text: 'Q1' },
      { text: 'Q2' },
    ] as unknown as GameResultDto['questionMetrics']

    const { container } = render(
      <SummarySection
        hostNickname="FrostyBear"
        mode={GameMode.ZeroToOneHundred}
        quiz={{ id: 'quizId', canHostLiveGame: false }}
        numberOfPlayers={2}
        numberOfQuestions={2}
        playerMetrics={playerMetrics}
        questionMetrics={questionMetrics}
        duration={45}
        created={CREATED_DATE}
      />,
    )

    expect(h.getAveragePrecision).toHaveBeenCalledTimes(2)
    expect(h.getCorrectPercentage).not.toHaveBeenCalled()
    expect(h.getQuizDifficultyMessage).toHaveBeenCalledWith(50)
    expect(screen.getByText('Difficulty: 50%')).toBeInTheDocument()

    const detailsCard = container.querySelector('.card.details') as HTMLElement
    const titles = Array.from(detailsCard.querySelectorAll('.title'))
    const getValueFor = (label: string) => {
      const titleEl = titles.find(
        (el) => el.textContent === label,
      ) as HTMLElement
      return titleEl.nextElementSibling?.textContent
    }
    expect(getValueFor('Players')).toBe(String(playerMetrics.length))
    expect(getValueFor('Questions')).toBe(String(questionMetrics.length))

    const playAgainButton = screen.getByRole('button', { name: /play again/i })
    expect(playAgainButton).toBeDisabled()
    expect(screen.getByText(/this quiz isn’t public yet/i)).toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  it('omits metric cards when playerMetrics has no data', () => {
    h.getCorrectPercentage.mockImplementationOnce(() => 100)
    const playerMetrics = [] as unknown as GameResultDto['playerMetrics']
    const questionMetrics = [
      { text: 'Q1' },
    ] as unknown as GameResultDto['questionMetrics']

    const { container } = render(
      <SummarySection
        hostNickname="FrostyBear"
        mode={GameMode.Classic}
        quiz={{ id: 'quizId', canHostLiveGame: false }}
        numberOfPlayers={2}
        numberOfQuestions={2}
        playerMetrics={playerMetrics}
        questionMetrics={questionMetrics}
        duration={0}
        created={CREATED_DATE}
      />,
    )

    expect(screen.queryByText('Fastest Overall Player')).toBeNull()
    expect(screen.queryByText('Longest Correct Streak')).toBeNull()

    expect(container).toMatchSnapshot()
  })

  it('opens confirm dialog when clicking Play again if allowed', async () => {
    h.getCorrectPercentage.mockImplementationOnce(() => 100)

    const playerMetrics = [
      {
        rank: 1,
        score: 100,
        averageResponseTime: 2,
        longestCorrectStreak: 3,
        player: { nickname: 'Alice' },
      },
    ] as unknown as GameResultDto['playerMetrics']

    const questionMetrics = [
      { text: 'Q1' },
    ] as unknown as GameResultDto['questionMetrics']

    render(
      <SummarySection
        hostNickname="FrostyBear"
        mode={GameMode.Classic}
        quiz={{ id: 'quizId', canHostLiveGame: true }}
        numberOfPlayers={1}
        numberOfQuestions={1}
        playerMetrics={playerMetrics}
        questionMetrics={questionMetrics}
        duration={10}
        created={CREATED_DATE}
      />,
    )

    screen.getByRole('button', { name: /play again/i }).click()

    expect(
      await screen.findByText(/are you sure you want to start hosting/i),
    ).toBeInTheDocument()
  })
})
