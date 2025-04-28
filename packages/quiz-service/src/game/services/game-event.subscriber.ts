import {
  Injectable,
  Logger,
  MessageEvent,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { GameEventType, GameParticipantType } from '@quiz/common'
import { Redis } from 'ioredis'
import { concat, finalize, from, fromEvent, Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

import { PlayerNotFoundException } from '../exceptions'

import { GameRepository } from './game.repository'
import { DistributedEvent } from './models/event'
import { TaskType } from './models/schemas'
import {
  buildHostGameEvent,
  buildPlayerGameEvent,
  getRedisPlayerParticipantAnswerKey,
  toBaseQuestionTaskEventMetaDataTuple,
  toPlayerQuestionPlayerEventMetaData,
} from './utils'

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
   * @param {Redis} redis - Redis instance for Pub/Sub operations.
   * @param {GameRepository} gameRepository - Repository for accessing game data.
   * @param {EventEmitter2} eventEmitter - EventEmitter for broadcasting events locally.
   */
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private gameRepository: GameRepository,
    private eventEmitter: EventEmitter2,
  ) {
    this.redisSubscriber = redis.duplicate()

    this.heartbeatIntervalId = setInterval(() => {
      this.emitEvent({ event: { type: GameEventType.GameHeartbeat } })
    }, 30000)
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
   * Subscribes to the observable stream of events for a game by its ID and player ID,
   * ensuring that only events relevant to the player are provided.
   *
   * @param {string} gameID - The unique identifier of the game.
   * @param {string} playerId - The ID of the player subscribing to the game events.
   *
   * @returns {Promise<Observable<MessageEvent>>} An observable of MessageEvent for the player.
   *
   * @throws {ActiveGameNotFoundByIDException} if no active game is found.
   * @throws {PlayerNotFoundException} if the player is not the host or a player in the game.
   */
  public async subscribe(
    gameID: string,
    playerId: string,
  ): Promise<Observable<MessageEvent>> {
    const document = await this.gameRepository.findGameByIDOrThrow(gameID)

    const participant = document.participants.find(
      (participant) => participant.player._id === playerId,
    )

    if (!participant) {
      throw new PlayerNotFoundException(playerId)
    }

    if (!this.activePlayers.has(playerId)) {
      this.activePlayers.add(playerId)
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

    const initialEvent: DistributedEvent = {
      playerId,
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

    return concat(from([initialEvent]), source).pipe(
      filter(
        (event) => event.playerId === undefined || event.playerId === playerId,
      ),
      map((event) => ({ data: JSON.stringify(event.event) })),
      finalize(() => this.activePlayers.delete(playerId)),
    )
  }
}
