import {
  Injectable,
  Logger,
  MessageEvent,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { InjectRedis } from '@nestjs-modules/ioredis'
import {
  GameEventType,
  GameParticipantType,
  HEARTBEAT_INTERVAL,
} from '@quiz/common'
import { Redis } from 'ioredis'
import { concat, finalize, from, fromEvent, Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

import { PlayerNotFoundException } from '../../game-core/exceptions'
import { GameRepository } from '../../game-core/repositories'
import { TaskType } from '../../game-core/repositories/models/schemas'
import { getRedisPlayerParticipantAnswerKey } from '../../game-core/utils'
import {
  buildHostGameEvent,
  buildPlayerGameEvent,
  toBaseQuestionTaskEventMetaDataTuple,
  toPlayerQuestionPlayerEventMetaData,
} from '../utils'

import { DistributedEvent } from './models/event'

const REDIS_PUBSUB_CHANNEL = 'events'
const LOCAL_EVENT_EMITTER_CHANNEL = 'event'

/**
 * GameEventSubscriber listens for game events from Redis and relays them
 * to connected players using EventEmitter for local broadcasting.
 */
@Injectable()
export class GameEventSubscriber implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GameEventSubscriber.name)
  private readonly heartbeatIntervalId: NodeJS.Timeout
  private readonly redisSubscriber: Redis
  private activePlayers = new Set<string>()

  /**
   * Constructs an instance of GameEventSubscriber.
   *
   * @param redis - Redis instance for Pub/Sub operations.
   * @param gameRepository - Repository for accessing game data.
   * @param eventEmitter - EventEmitter for broadcasting events locally.
   */
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly gameRepository: GameRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.redisSubscriber = redis.duplicate()

    this.heartbeatIntervalId = setInterval(() => {
      this.emitEvent({ event: { type: GameEventType.GameHeartbeat } })
    }, HEARTBEAT_INTERVAL)
  }

  /**
   * Lifecycle hook that runs when the module is initialized. It sets up
   * Redis subscriptions for the defined Pub/Sub channel, allowing the service
   * to receive and handle messages, while logging the subscription status.
   */
  async onModuleInit() {
    await this.redisSubscriber.subscribe(
      REDIS_PUBSUB_CHANNEL,
      (error, count) => {
        if (error) {
          this.logger.error(`Subscription error: ${error.message}`, error)
          throw error
        }
        this.logger.log(`Subscribed to ${count} channels.`)
      },
    )

    this.redisSubscriber.on('message', async (_, message: string) => {
      const event = JSON.parse(message) as DistributedEvent
      this.emitEvent(event)
    })

    this.redisSubscriber.on('error', (error) =>
      this.logger.error(`Redis error: ${error.message}`, error),
    )
  }

  /**
   * Lifecycle hook that stops the heartbeat emitter when the service is destroyed,
   * ensuring no ongoing tasks remain active after service shutdown.
   */
  onModuleDestroy() {
    clearInterval(this.heartbeatIntervalId)
  }

  /**
   * Emits a distributed event to the local event channel for consumption within the application.
   * This is used internally to broadcast events to active SSE subscriptions.
   *
   * @param {DistributedEvent} event - The event to emit, which can be a heartbeat or specific game event.
   *
   * @private
   */
  private emitEvent(event: DistributedEvent) {
    this.eventEmitter.emit(LOCAL_EVENT_EMITTER_CHANNEL, event)
  }

  /**
   * Subscribes to the observable stream of events for a game by its ID and participant ID,
   * ensuring that only events relevant to the player are provided.
   *
   * @param gameId - The unique identifier of the game.
   * @param participantId - The unique identifier of the participant subscribing to the game events.
   *
   * @returns An observable of MessageEvent for the participant.
   *
   * @throws {ActiveGameNotFoundByIDException} if no active game is found.
   * @throws {PlayerNotFoundException} if the player is not the host or a player in the game.
   */
  public async subscribe(
    gameId: string,
    participantId: string,
  ): Promise<Observable<MessageEvent>> {
    const document = await this.gameRepository.findGameByIDOrThrow(gameId)

    const participant = document.participants.find(
      (participant) => participant.participantId === participantId,
    )

    if (!participant) {
      throw new PlayerNotFoundException(participantId)
    }

    if (!this.activePlayers.has(participantId)) {
      this.activePlayers.add(participantId)
    }

    const source = fromEvent(
      this.eventEmitter,
      LOCAL_EVENT_EMITTER_CHANNEL,
    ) as Observable<DistributedEvent>

    const [answers, metaData] = toBaseQuestionTaskEventMetaDataTuple(
      await this.redis.lrange(
        getRedisPlayerParticipantAnswerKey(document._id),
        0,
        -1,
      ),
      {},
      document.participants,
    )

    let initialEvent: DistributedEvent | undefined

    try {
      initialEvent = {
        playerId: participantId,
        event:
          participant.type === GameParticipantType.PLAYER
            ? buildPlayerGameEvent(document, participant, {
                ...metaData,
                ...(document.currentTask.type === TaskType.Question
                  ? toPlayerQuestionPlayerEventMetaData(answers, participant)
                  : {}),
              })
            : buildHostGameEvent(document, metaData),
      }
    } catch (error) {
      const { message, stack } = error as Error
      this.logger.warn(
        `Error building initial event for participant ${participantId}: ${message}`,
        stack,
      )
    }

    return concat(from([initialEvent]), source).pipe(
      filter(
        (event) =>
          !!event &&
          (event.playerId === undefined || event.playerId === participantId),
      ),
      map((event) => ({ data: JSON.stringify(event.event) })),
      finalize(() => this.activePlayers.delete(participantId)),
    )
  }
}
