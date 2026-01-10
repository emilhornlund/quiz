import { GameStatus } from '@klurigo/common'
import type { QueryFilter } from 'mongoose'

import { GameRepository } from './game.repository'
import type { Game } from './models/schemas'

describe('GameRepository.hasCompletedGamesByQuizIdAndParticipantId', () => {
  let repository: GameRepository
  let existsMock: jest.MockedFunction<
    (filter: QueryFilter<Game>) => Promise<boolean>
  >

  beforeEach(() => {
    jest.clearAllMocks()

    repository = Object.create(GameRepository.prototype) as GameRepository

    existsMock = jest
      .fn<Promise<boolean>, [QueryFilter<Game>]>()
      .mockName('exists')
    ;(repository as unknown as { exists: typeof existsMock }).exists =
      existsMock
  })

  it('calls exists with the expected filter and returns true', async () => {
    existsMock.mockResolvedValueOnce(true)

    await expect(
      repository.hasCompletedGamesByQuizIdAndParticipantId('quiz-1', 'user-1'),
    ).resolves.toBe(true)

    expect(existsMock).toHaveBeenCalledTimes(1)
    expect(existsMock).toHaveBeenCalledWith({
      status: { $in: [GameStatus.Completed] },
      'quiz._id': 'quiz-1',
      'participants.participantId': 'user-1',
    })
  })

  it('calls exists with the expected filter and returns false', async () => {
    existsMock.mockResolvedValueOnce(false)

    await expect(
      repository.hasCompletedGamesByQuizIdAndParticipantId('quiz-1', 'user-1'),
    ).resolves.toBe(false)

    expect(existsMock).toHaveBeenCalledTimes(1)
    expect(existsMock).toHaveBeenCalledWith({
      status: { $in: [GameStatus.Completed] },
      'quiz._id': 'quiz-1',
      'participants.participantId': 'user-1',
    })
  })

  it('propagates errors thrown by exists', async () => {
    existsMock.mockRejectedValueOnce(new Error('db failed'))

    await expect(
      repository.hasCompletedGamesByQuizIdAndParticipantId('quiz-1', 'user-1'),
    ).rejects.toThrow('db failed')

    expect(existsMock).toHaveBeenCalledTimes(1)
    expect(existsMock).toHaveBeenCalledWith({
      status: { $in: [GameStatus.Completed] },
      'quiz._id': 'quiz-1',
      'participants.participantId': 'user-1',
    })
  })
})
