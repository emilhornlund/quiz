import {
  GameEventType,
  GameParticipantType,
  HEARTBEAT_INTERVAL,
} from '@klurigo/common'
import { MessageEvent } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import type { Redis } from 'ioredis'
import { firstValueFrom, take, toArray } from 'rxjs'

import { PlayerNotFoundException } from '../../game-core/exceptions'
import { GameAnswerRepository } from '../../game-core/repositories'
import { TaskType } from '../../game-core/repositories/models/schemas'
import {
  buildHostGameEvent,
  buildPlayerGameEvent,
  toGameEventMetaData,
  toPlayerQuestionPlayerEventMetaData,
} from '../utils'

import { GameEventSubscriber } from './game-event.subscriber'

// ---- Mocks ----
jest.mock('../utils', () => ({
  buildHostGameEvent: jest.fn(),
  buildPlayerGameEvent: jest.fn(),
  toGameEventMetaData: jest.fn(),
  toPlayerQuestionPlayerEventMetaData: jest.fn(),
}))

describe('GameEventSubscriber', () => {
  let redis: jest.Mocked<Redis>
  let redisSubscriber: jest.Mocked<Redis>
  let gameRepository: any
  let gameAnswerRepository: jest.Mocked<GameAnswerRepository>
  let eventEmitter: EventEmitter2
  let service: GameEventSubscriber
  let logger: { log: jest.Mock; warn: jest.Mock; error: jest.Mock }

  beforeEach(() => {
    logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }

    jest.useFakeTimers()

    // Base redis mock + a dedicated subscriber connection
    redisSubscriber = {
      subscribe: jest.fn().mockResolvedValue(1),
      on: jest.fn(),
      off: jest.fn(),
      unsubscribe: jest.fn().mockResolvedValue(1),
      quit: jest.fn().mockResolvedValue('OK'),
      disconnect: jest.fn(),
    } as any

    redis = {
      duplicate: jest.fn(() => redisSubscriber as unknown as Redis),
      lrange: jest.fn().mockResolvedValue([]),
    } as any

    // Minimal gameRepository mock
    gameRepository = {
      findGameByIDOrThrow: jest.fn(),
    }

    gameAnswerRepository = {
      findAllAnswersByGameId: jest.fn().mockResolvedValue([]),
      submitOnce: jest.fn(),
      clear: jest.fn(),
    } as any

    eventEmitter = new EventEmitter2()

    // Reset util mocks per test
    ;(buildHostGameEvent as jest.Mock).mockReset()
    ;(buildPlayerGameEvent as jest.Mock).mockReset()
    ;(toGameEventMetaData as jest.Mock)
      .mockReset()
      .mockReturnValue({ meta: true })
    ;(toPlayerQuestionPlayerEventMetaData as jest.Mock)
      .mockReset()
      .mockReturnValue({ pmeta: true })

    service = new GameEventSubscriber(
      redis as unknown as Redis,
      gameRepository,
      gameAnswerRepository,
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

  it('wires Redis subscription on init and handles messages/errors', async () => {
    await service.onModuleInit()

    expect(redis.duplicate).toHaveBeenCalledTimes(1)
    expect(redisSubscriber.subscribe).toHaveBeenCalledWith('events')

    // Extract message handler registered via on('message')
    const onMessage = redisSubscriber.on.mock.calls.find(
      (c) => c[0] === 'message',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    )?.[1] as Function
    expect(onMessage).toBeDefined()

    const onError = redisSubscriber.on.mock.calls.find(
      (c) => c[0] === 'error',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    )?.[1] as Function
    expect(onError).toBeDefined()

    const emitSpy = jest.spyOn(eventEmitter, 'emit')

    const distributed = { playerId: 'p1', event: { type: 'ANY' } }
    onMessage('events', JSON.stringify(distributed))
    expect(emitSpy).toHaveBeenCalledWith('event', distributed)

    onError(new Error('boom'))
    expect(logger.error).toHaveBeenCalled()
  })

  it('onModuleInit ignores invalid JSON messages and logs warn', async () => {
    await service.onModuleInit()

    const onMessage = redisSubscriber.on.mock.calls.find(
      (c) => c[0] === 'message',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    )?.[1] as Function
    expect(onMessage).toBeDefined()

    onMessage('events', '{not valid json')

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'Ignoring invalid JSON on Redis Pub/Sub channel:',
      ),
      expect.any(String),
    )
  })

  it('onModuleInit ignores malformed messages missing event and logs warn', async () => {
    await service.onModuleInit()

    const onMessage = redisSubscriber.on.mock.calls.find(
      (c) => c[0] === 'message',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    )?.[1] as Function
    expect(onMessage).toBeDefined()

    onMessage('events', JSON.stringify({ playerId: 'p1' }))

    expect(logger.warn).toHaveBeenCalledWith(
      'Ignoring malformed distributed event (missing event property).',
    )
  })

  it('onModuleInit logs error and rethrows when Redis subscribe fails', async () => {
    redisSubscriber.subscribe.mockRejectedValueOnce(new Error('subscribe down'))

    await expect(service.onModuleInit()).rejects.toThrow('subscribe down')

    expect(logger.error).toHaveBeenCalledWith(
      'Failed to subscribe to Redis channel "events": subscribe down',
      expect.any(String),
    )
  })

  it('emits heartbeats while a subscription is active and stops after unsubscribe', async () => {
    const doc = buildGameDoc()
    gameRepository.findGameByIDOrThrow.mockResolvedValue(doc)
    ;(buildPlayerGameEvent as jest.Mock).mockReturnValue({ initial: true })

    const emitSpy = jest.spyOn(eventEmitter, 'emit')

    const stream$ = await service.subscribe('game-1', 'p1')
    const sub = stream$.subscribe()

    jest.advanceTimersByTime(HEARTBEAT_INTERVAL)
    expect(emitSpy).toHaveBeenCalledWith('event', {
      event: { type: GameEventType.GameHeartbeat },
    })

    sub.unsubscribe()

    emitSpy.mockClear()
    jest.advanceTimersByTime(HEARTBEAT_INTERVAL)
    expect(emitSpy).not.toHaveBeenCalled()
  })

  it('keeps heartbeat running until the last concurrent connection unsubscribes', async () => {
    const doc = buildGameDoc()
    gameRepository.findGameByIDOrThrow.mockResolvedValue(doc)
    ;(buildPlayerGameEvent as jest.Mock).mockReturnValue({ initial: true })

    const emitSpy = jest.spyOn(eventEmitter, 'emit')

    const stream1$ = await service.subscribe('game-1', 'p1')
    const sub1 = stream1$.subscribe()

    const stream2$ = await service.subscribe('game-1', 'p1')
    const sub2 = stream2$.subscribe()

    jest.advanceTimersByTime(HEARTBEAT_INTERVAL)
    expect(
      emitSpy.mock.calls.filter(
        (c) =>
          c[0] === 'event' && c[1]?.event?.type === GameEventType.GameHeartbeat,
      ),
    ).toHaveLength(1)

    sub1.unsubscribe()

    emitSpy.mockClear()
    jest.advanceTimersByTime(HEARTBEAT_INTERVAL)
    expect(
      emitSpy.mock.calls.filter(
        (c) =>
          c[0] === 'event' && c[1]?.event?.type === GameEventType.GameHeartbeat,
      ),
    ).toHaveLength(1)

    sub2.unsubscribe()

    emitSpy.mockClear()
    jest.advanceTimersByTime(HEARTBEAT_INTERVAL)
    expect(emitSpy).not.toHaveBeenCalled()
  })

  it('onModuleDestroy unsubscribes, quits, and removes Redis listeners', async () => {
    await service.onModuleInit()

    await service.onModuleDestroy()

    expect(redisSubscriber.off).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    )
    expect(redisSubscriber.off).toHaveBeenCalledWith(
      'error',
      expect.any(Function),
    )
    expect(redisSubscriber.unsubscribe).toHaveBeenCalledWith('events')
    expect(redisSubscriber.quit).toHaveBeenCalled()
    expect(redisSubscriber.disconnect).not.toHaveBeenCalled()
  })

  it('onModuleDestroy logs warn and disconnects if Redis shutdown throws', async () => {
    await service.onModuleInit()

    redisSubscriber.unsubscribe.mockRejectedValueOnce(new Error('unsub fail'))

    await service.onModuleDestroy()

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'Error while shutting down Redis subscriber: unsub fail',
      ),
      expect.any(String),
    )
    expect(redisSubscriber.disconnect).toHaveBeenCalled()
  })

  it('subscribe throws when participant not found', async () => {
    gameRepository.findGameByIDOrThrow.mockResolvedValue(buildGameDoc())
    await expect(service.subscribe('game-1', 'missing')).rejects.toBeInstanceOf(
      PlayerNotFoundException,
    )
  })

  it('subscribe (PLAYER) returns initial event and filters subsequent events by playerId', async () => {
    const doc = buildGameDoc({
      currentTask: { type: TaskType.Question }, // so player metadata is merged
    })
    gameRepository.findGameByIDOrThrow.mockResolvedValue(doc)
    ;(buildPlayerGameEvent as jest.Mock).mockReturnValue({
      initial: 'player',
    })

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

    const counts: Map<string, number> = (service as any)
      .connectionCountsByParticipantId
    expect(counts.has('p1')).toBe(false)

    // Ensure metadata builders were used
    expect(gameAnswerRepository.findAllAnswersByGameId).toHaveBeenCalledWith(
      'game-1',
    )
    expect(toGameEventMetaData).toHaveBeenCalled()
    expect(toPlayerQuestionPlayerEventMetaData).toHaveBeenCalled()
    expect(buildPlayerGameEvent).toHaveBeenCalledWith(
      doc,
      doc.participants[0], // p1
      expect.objectContaining({ meta: true, pmeta: true }),
    )
  })

  it('subscribe filters out undefined events emitted on the local channel', async () => {
    const doc = buildGameDoc()
    gameRepository.findGameByIDOrThrow.mockResolvedValue(doc)
    ;(buildPlayerGameEvent as jest.Mock).mockReturnValue({ initial: 'player' })

    const stream$ = await service.subscribe('game-1', 'p1')
    const resultsPromise = firstValueFrom(stream$.pipe(take(2), toArray()))

    eventEmitter.emit('event', undefined)
    eventEmitter.emit('event', { playerId: 'p1', event: { type: 'OK' } })

    const results = await resultsPromise
    expect(results.map((e) => JSON.parse(e.data as any))).toEqual([
      { initial: 'player' },
      { type: 'OK' },
    ])
  })

  it('subscribe (HOST) uses buildHostGameEvent and still filters by playerId', async () => {
    const doc = buildGameDoc()
    gameRepository.findGameByIDOrThrow.mockResolvedValue(doc)
    ;(buildHostGameEvent as jest.Mock).mockReturnValue({
      initial: 'host',
    })

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

  it('subscribe tolerates build* error and still relays future events', async () => {
    const doc = buildGameDoc()
    gameRepository.findGameByIDOrThrow.mockResolvedValue(doc)
    ;(buildHostGameEvent as jest.Mock).mockImplementation(() => {
      throw new Error('boom in builder')
    })

    const stream$ = await service.subscribe('game-1', 'host')

    // Collect next two events we emit ourselves (no initial because builder throws)
    const resultsPromise = firstValueFrom(stream$.pipe(take(3), toArray()))

    eventEmitter.emit('event', { playerId: 'host', event: { type: 'A' } })
    eventEmitter.emit('event', { event: { type: 'B' } })

    const results = await resultsPromise
    expect(results.map((e) => JSON.parse(e.data as any))).toEqual([
      { type: GameEventType.GameHeartbeat },
      { type: 'A' },
      { type: 'B' },
    ])
    expect(logger.warn).toHaveBeenCalled()
  })

  it('subscribe falls back to heartbeat when gameAnswerRepository.findAllAnswersByGameId fails during initial snapshot', async () => {
    const doc = buildGameDoc()
    gameRepository.findGameByIDOrThrow.mockResolvedValue(doc)
    gameAnswerRepository.findAllAnswersByGameId.mockRejectedValue(
      new Error('Repository failed'),
    )

    const stream$ = await service.subscribe('game-1', 'host')
    const resultsPromise = firstValueFrom(stream$.pipe(take(1)))

    const result = await resultsPromise
    expect(JSON.parse(result.data as any)).toEqual({
      type: GameEventType.GameHeartbeat,
    })

    expect(gameAnswerRepository.findAllAnswersByGameId).toHaveBeenCalledWith(
      'game-1',
    )
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Error building initial event for participant'),
      expect.any(String),
    )
  })
})
