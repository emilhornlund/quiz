import { GameParticipantType } from '@klurigo/common'
import type { Redis } from 'ioredis'

import {
  GameDocument,
  TaskType,
} from '../../game-core/repositories/models/schemas'

// eslint-disable-next-line import/order
import { GameEventPublisher } from './game-event.publisher'

// ---- Mocks ----
jest.mock('../../game-core/utils', () => ({
  getRedisPlayerParticipantAnswerKey: jest.fn(() => 'ans:key'),
}))

// eslint-disable-next-line import/order
import { getRedisPlayerParticipantAnswerKey } from '../../game-core/utils'

jest.mock('../utils', () => ({
  buildHostGameEvent: jest.fn(),
  buildPlayerGameEvent: jest.fn(),
  toBaseQuestionTaskEventMetaDataTuple: jest.fn(),
  toPlayerQuestionPlayerEventMetaData: jest.fn(),
}))

import {
  buildHostGameEvent,
  buildPlayerGameEvent,
  toBaseQuestionTaskEventMetaDataTuple,
  toPlayerQuestionPlayerEventMetaData,
} from '../utils'

describe('GameEventPublisher', () => {
  let redis: jest.Mocked<Redis>
  let service: GameEventPublisher
  let logger: { log: jest.Mock; warn: jest.Mock; error: jest.Mock }

  beforeEach(() => {
    logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }

    redis = {
      lrange: jest.fn().mockResolvedValue([]),
      publish: jest.fn().mockResolvedValue(1),
    } as any

    // Reset util mocks
    ;(buildHostGameEvent as jest.Mock).mockReset()
    ;(buildPlayerGameEvent as jest.Mock).mockReset()
    ;(getRedisPlayerParticipantAnswerKey as jest.Mock)
      .mockReset()
      .mockReturnValue('ans:key')
    ;(toBaseQuestionTaskEventMetaDataTuple as jest.Mock)
      .mockReset()
      .mockReturnValue([[], { meta: true }])
    ;(toPlayerQuestionPlayerEventMetaData as jest.Mock)
      .mockReset()
      .mockReturnValue({ pmeta: true })

    service = new GameEventPublisher(redis as unknown as Redis)
    // Override internal logger for assertions (same trick as previous tests)
    ;(service as any).logger = logger
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const buildGameDoc = (overrides: Partial<any> = {}) => ({
    _id: 'game-1',
    currentTask: { type: TaskType.Lobby },
    participants: [
      {
        participantId: 'p1',
        type: GameParticipantType.PLAYER,
        nickname: 'Alice',
      },
      {
        participantId: 'host',
        type: GameParticipantType.HOST,
        nickname: 'Host',
      },
    ],
    ...overrides,
  })

  test('publish sends events for host and player with base metadata (non-question)', async () => {
    const doc = buildGameDoc()
    ;(buildHostGameEvent as jest.Mock).mockReturnValue({
      hostInit: true,
    })
    ;(buildPlayerGameEvent as jest.Mock).mockReturnValue({
      playerInit: true,
    })

    await service.publish(doc as GameDocument)

    // Collected answers & metadata
    expect(getRedisPlayerParticipantAnswerKey).toHaveBeenCalledWith('game-1')
    expect(toBaseQuestionTaskEventMetaDataTuple).toHaveBeenCalledWith(
      [],
      {},
      doc.participants,
    )
    // No question-specific metadata for Lobby
    expect(toPlayerQuestionPlayerEventMetaData).not.toHaveBeenCalled()

    // Builders used correctly
    expect(buildHostGameEvent).toHaveBeenCalledWith(
      doc,
      expect.objectContaining({ meta: true }),
    )
    expect(buildPlayerGameEvent).toHaveBeenCalledWith(
      doc,
      doc.participants[0],
      expect.objectContaining({ meta: true }),
    )

    // Publish was called once per participant
    expect(redis.publish).toHaveBeenCalledTimes(2)
    const payloads = (redis.publish.mock.calls as unknown[][]).map(
      (c) => JSON.parse(c[1] as string), // channel is c[0], message is c[1]
    )
    expect(payloads).toEqual(
      expect.arrayContaining([
        { playerId: 'p1', event: { playerInit: true } },
        { playerId: 'host', event: { hostInit: true } },
      ]),
    )

    // Logger: should log for each publish
    expect(logger.log).toHaveBeenCalledWith('Published event for playerId: p1')
    expect(logger.log).toHaveBeenCalledWith(
      'Published event for playerId: host',
    )
  })

  test('publish (Question task) merges player question metadata', async () => {
    const doc = buildGameDoc({ currentTask: { type: TaskType.Question } })
    ;(buildHostGameEvent as jest.Mock).mockReturnValue({
      hostQ: true,
    })
    ;(buildPlayerGameEvent as jest.Mock).mockReturnValue({
      playerQ: true,
    })

    await service.publish(doc as GameDocument)

    // Question-specific metadata should be computed for players
    expect(toPlayerQuestionPlayerEventMetaData).toHaveBeenCalledWith(
      [],
      doc.participants[0],
    )
    expect(buildPlayerGameEvent).toHaveBeenCalledWith(
      doc,
      doc.participants[0],
      expect.objectContaining({ meta: true, pmeta: true }),
    )
    // Host path should not receive pmeta
    expect(buildHostGameEvent).toHaveBeenCalledWith(
      doc,
      expect.objectContaining({ meta: true }),
    )
  })

  test('publish continues when a builder throws, logging warn', async () => {
    const doc = buildGameDoc()
    // Fail for host, succeed for player
    ;(buildHostGameEvent as jest.Mock).mockImplementation(() => {
      throw new Error('boom host')
    })
    ;(buildPlayerGameEvent as jest.Mock).mockReturnValue({
      ok: true,
    })

    await service.publish(doc as GameDocument)

    // One warn logged for the host failure
    expect(logger.warn).toHaveBeenCalled()
    // Player still published
    expect(redis.publish).toHaveBeenCalledTimes(1)
    const msg = JSON.parse(redis.publish.mock.calls[0][1] as string)
    expect(msg).toEqual({ playerId: 'p1', event: { ok: true } })
  })

  test('publishParticipantEvent is a no-op when event is undefined', async () => {
    const participant = {
      participantId: 'p1',
      type: GameParticipantType.PLAYER,
      nickname: 'Alice',
    }

    await service.publishParticipantEvent(participant as any, undefined)

    expect(redis.publish).not.toHaveBeenCalled()
    expect(logger.log).not.toHaveBeenCalled()
  })

  test('publishParticipantEvent publishes a distributed event and logs', async () => {
    const participant = {
      participantId: 'p1',
      type: GameParticipantType.PLAYER,
      nickname: 'Alice',
    }

    const event = { some: 'event' } as any

    await service.publishParticipantEvent(participant as any, event)

    expect(redis.publish).toHaveBeenCalledTimes(1)
    const [channel, message] = redis.publish.mock.calls[0] as [string, string]
    expect(channel).toBe('events')
    expect(JSON.parse(message)).toEqual({ playerId: 'p1', event })
    expect(logger.log).toHaveBeenCalledWith('Published event for playerId: p1')
  })

  test('publish logs error if redis.publish rejects', async () => {
    redis.publish.mockRejectedValueOnce(new Error('redis down'))

    const participant = {
      participantId: 'p1',
      type: GameParticipantType.PLAYER,
      nickname: 'Alice',
    }

    const event = { x: 1 } as any

    await service.publishParticipantEvent(participant as any, event)

    expect(logger.error).toHaveBeenCalledWith(
      'Error publishing event:',
      expect.any(Error),
    )
  })
})
