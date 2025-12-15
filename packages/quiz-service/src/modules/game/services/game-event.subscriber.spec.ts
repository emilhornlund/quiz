import { MessageEvent } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { GameEventType, GameParticipantType } from '@quiz/common'
import type { Redis } from 'ioredis'
import { firstValueFrom, take, toArray } from 'rxjs'

import { PlayerNotFoundException } from '../exceptions'
import { TaskType } from '../repositories/models/schemas'

// eslint-disable-next-line import/order
import { GameEventSubscriber } from './game-event.subscriber'

// ---- Mocks ----
jest.mock('./utils', () => ({
  buildHostGameEvent: jest.fn(),
  buildPlayerGameEvent: jest.fn(),
  getRedisPlayerParticipantAnswerKey: jest.fn(() => 'ans:key'),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  toBaseQuestionTaskEventMetaDataTuple: jest.fn(() => [[], { meta: true }]),
  toPlayerQuestionPlayerEventMetaData: jest.fn(() => ({ pmeta: true })),
}))

import {
  buildHostGameEvent,
  buildPlayerGameEvent,
  getRedisPlayerParticipantAnswerKey,
  toBaseQuestionTaskEventMetaDataTuple,
  toPlayerQuestionPlayerEventMetaData,
} from './utils'

describe('GameEventSubscriber', () => {
  let redis: jest.Mocked<Redis>
  let redisSubscriber: jest.Mocked<Redis>
  let gameRepository: any
  let eventEmitter: EventEmitter2
  let service: GameEventSubscriber
  let logger: { log: jest.Mock; warn: jest.Mock; error: jest.Mock }

  beforeEach(() => {
    logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }

    jest.useFakeTimers()

    // Base redis mock + a dedicated subscriber connection
    redisSubscriber = {
      subscribe: jest.fn((_, cb) => {
        // simulate successful subscribe
        cb?.(null as any, 1)
        return Promise.resolve(1) as any
      }),
      on: jest.fn(),
    } as any

    redis = {
      duplicate: jest.fn(() => redisSubscriber as unknown as Redis),
      lrange: jest.fn().mockResolvedValue([]),
    } as any

    // Minimal gameRepository mock
    gameRepository = {
      findGameByIDOrThrow: jest.fn(),
    }

    eventEmitter = new EventEmitter2()

    // Reset util mocks per test
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

    service = new GameEventSubscriber(
      redis as unknown as Redis,
      gameRepository,
      eventEmitter,
    )

    // Override the internal logger so we can spy on .error()
    ;(service as any).logger = logger
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
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

  test('wires Redis subscription on init and handles messages/errors', async () => {
    await service.onModuleInit()

    expect(redis.duplicate).toHaveBeenCalledTimes(1)
    expect(redisSubscriber.subscribe).toHaveBeenCalledWith(
      'events',
      expect.any(Function),
    )

    // Extract message handler registered via on('message')
    const onMessage = redisSubscriber.on.mock.calls.find(
      (c) => c[0] === 'message',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    )?.[1] as Function
    const onError = redisSubscriber.on.mock.calls.find(
      (c) => c[0] === 'error',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    )?.[1] as Function
    const emitSpy = jest.spyOn(eventEmitter, 'emit')

    const distributed = { playerId: 'p1', event: { type: 'ANY' } }
    onMessage('events', JSON.stringify(distributed))
    expect(emitSpy).toHaveBeenCalledWith('event', distributed)

    onError(new Error('boom'))
    expect(logger.error).toHaveBeenCalled()
  })

  test('emits heartbeat every 30s and stops after destroy', async () => {
    const emitSpy = jest.spyOn(eventEmitter, 'emit')

    // No immediate emit
    expect(emitSpy).not.toHaveBeenCalled()

    // First heartbeat at 30s
    jest.advanceTimersByTime(30_000)
    expect(emitSpy).toHaveBeenCalledWith('event', {
      event: { type: GameEventType.GameHeartbeat },
    })

    // Destroy and ensure no more heartbeats
    service.onModuleDestroy()
    jest.advanceTimersByTime(60_000)
    // still only the first heartbeat call
    expect(
      emitSpy.mock.calls.filter(
        (c) => c[1]?.event?.type === GameEventType.GameHeartbeat,
      ),
    ).toHaveLength(1)
  })

  test('subscribe throws when participant not found', async () => {
    gameRepository.findGameByIDOrThrow.mockResolvedValue(buildGameDoc())
    await expect(service.subscribe('game-1', 'missing')).rejects.toBeInstanceOf(
      PlayerNotFoundException,
    )
  })

  test('subscribe (PLAYER) returns initial event and filters subsequent events by playerId', async () => {
    const doc = buildGameDoc({
      currentTask: { type: TaskType.Question }, // so player metadata is merged
    })
    gameRepository.findGameByIDOrThrow.mockResolvedValue(doc)
    ;(buildPlayerGameEvent as jest.Mock).mockReturnValue({ initial: 'player' })

    const stream$ = await service.subscribe('game-1', 'p1')

    const received: MessageEvent[] = []
    const sub = stream$.subscribe((e) => received.push(e))

    // Initial emission comes from concat(from([initialEvent]), source)
    expect(received[0]?.data).toBe(JSON.stringify({ initial: 'player' }))

    // Emit a matching event for p1 -> should pass
    eventEmitter.emit('event', { playerId: 'p1', event: { type: 'MATCH' } })

    // Emit a non-matching event for host -> should be filtered
    eventEmitter.emit('event', { playerId: 'host', event: { type: 'NOPE' } })

    // Emit a broadcast event (no playerId) -> passes to everyone
    eventEmitter.emit('event', { event: { type: 'BROADCAST' } })

    // Unsubscribe -> finalize should remove active player
    sub.unsubscribe()

    // We should have 3 emissions total (initial + MATCH + BROADCAST)
    expect(received.map((e) => JSON.parse(e.data as any))).toEqual([
      { initial: 'player' },
      { type: 'MATCH' },
      { type: 'BROADCAST' },
    ])

    // Active players should be cleaned up
    // (accessing private for test purposes)
    const activePlayers: Set<string> = (service as any).activePlayers
    expect(activePlayers.has('p1')).toBe(false)

    // Ensure metadata builders were used
    expect(getRedisPlayerParticipantAnswerKey).toHaveBeenCalledWith('game-1')
    expect(toBaseQuestionTaskEventMetaDataTuple).toHaveBeenCalled()
    expect(toPlayerQuestionPlayerEventMetaData).toHaveBeenCalled()
    expect(buildPlayerGameEvent).toHaveBeenCalledWith(
      doc,
      doc.participants[0], // p1
      expect.objectContaining({ meta: true, pmeta: true }),
    )
  })

  test('subscribe (HOST) uses buildHostGameEvent and still filters by playerId', async () => {
    const doc = buildGameDoc()
    gameRepository.findGameByIDOrThrow.mockResolvedValue(doc)
    ;(buildHostGameEvent as jest.Mock).mockReturnValue({ initial: 'host' })

    const stream$ = await service.subscribe('game-1', 'host')
    const out = firstValueFrom(stream$.pipe(take(1)))

    const first = await out
    expect(JSON.parse(first.data as any)).toEqual({ initial: 'host' })
    expect(buildHostGameEvent).toHaveBeenCalledWith(
      doc,
      expect.objectContaining({ meta: true }),
    )
    expect(buildPlayerGameEvent).not.toHaveBeenCalled()
  })

  test('subscribe tolerates build* error and still relays future events', async () => {
    const doc = buildGameDoc()
    gameRepository.findGameByIDOrThrow.mockResolvedValue(doc)
    ;(buildHostGameEvent as jest.Mock).mockImplementation(() => {
      throw new Error('boom in builder')
    })

    const stream$ = await service.subscribe('game-1', 'host')

    // Collect next two events we emit ourselves (no initial because builder throws)
    const resultsPromise = firstValueFrom(stream$.pipe(take(2), toArray()))

    eventEmitter.emit('event', { playerId: 'host', event: { type: 'A' } })
    eventEmitter.emit('event', { event: { type: 'B' } }) // broadcast

    const results = await resultsPromise
    expect(results.map((e) => JSON.parse(e.data as any))).toEqual([
      { type: 'A' },
      { type: 'B' },
    ])
    expect(logger.warn).toHaveBeenCalled()
  })
})
