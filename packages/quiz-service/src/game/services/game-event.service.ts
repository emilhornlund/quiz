import {
  Injectable,
  Logger,
  MessageEvent,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { GameEventType } from '@quiz/common'
import { Redis } from 'ioredis'
import { concat, finalize, from, fromEvent, Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

import { PlayerNotFoundException } from '../exceptions'

import { GameRepository } from './game.repository'
import { DistributedEvent } from './models/event'
import { GameDocument } from './models/schemas'
import { buildHostGameEvent, buildPlayerGameEvent } from './utils'

const REDIS_PUBSUB_CHANNEL = 'events'
const LOCAL_EVENT_EMITTER_CHANNEL = 'event'

/**
 * GameEventService is responsible for managing event streams for game clients and
 * broadcasting relevant events using Redis and EventEmitter.
 */
@Injectable()
export class GameEventService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GameEventService.name)
  private readonly heartbeatIntervalId: NodeJS.Timeout
  private readonly redisSubscriber: Redis
  private activeClients = new Set<string>()

  /**
   * Initializes the service by setting up a Redis subscriber for event broadcasting
   * and a heartbeat emitter for periodic connection monitoring.
   *
   * @param {Redis} redis - Redis instance for Pub/Sub operations.
   * @param {GameRepository} gameRepository - Repository for accessing and modifying game data.
   * @param {EventEmitter2} eventEmitter - EventEmitter2 instance for in-app event broadcasting.
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
   * Retrieves the observable stream of events for a game by its ID and client ID,
   * ensuring that only events relevant to the client are provided.
   *
   * @param {string} gameID - The unique identifier of the game.
   * @param {string} clientId - The client ID requesting the stream.
   *
   * @returns {Promise<Observable<MessageEvent>>} An observable of MessageEvent for the client.
   *
   * @throws {ActiveGameNotFoundByIDException} if no active game is found.
   * @throws {PlayerNotFoundException} if the client is not the host or a player in the game.
   */
  public async getEventStream(
    gameID: string,
    clientId: string,
  ): Promise<Observable<MessageEvent>> {
    const document = await this.gameRepository.findGameByIDOrThrow(gameID)

    const player = document.players.find((player) => player._id === clientId)

    if (document.hostClientId !== clientId && !player) {
      throw new PlayerNotFoundException(clientId)
    }

    if (!this.activeClients.has(clientId)) {
      this.activeClients.add(clientId)
    }

    const source = fromEvent(
      this.eventEmitter,
      LOCAL_EVENT_EMITTER_CHANNEL,
    ) as Observable<DistributedEvent>

    return concat(
      from([
        {
          clientId,
          event: player
            ? buildPlayerGameEvent(document, player)
            : buildHostGameEvent(document),
        },
      ]),
      source,
    ).pipe(
      filter(
        (event) => event.clientId === undefined || event.clientId === clientId,
      ),
      map((event) => ({ data: JSON.stringify(event.event) })),
      finalize(() => this.activeClients.delete(clientId)),
    )
  }

  /**
   * Publishes events to all relevant clients for a given game document.
   *
   * @param {GameDocument} document - Mongoose document of the game to publish events for.
   */
  public async publish(document: GameDocument): Promise<void> {
    await Promise.all([
      this.publishDistributedEvent({
        clientId: document.hostClientId,
        event: buildHostGameEvent(document),
      }),
      ...document.players.map((player) => ({
        clientId: player._id,
        event: buildPlayerGameEvent(document, player),
      })),
    ])
  }

  /**
   * Emits a distributed event to the local event channel for consumption within the application.
   *
   * @param {DistributedEvent} event - The distributed event to be published to Redis.
   *
   * @private
   */
  private async publishDistributedEvent(
    event: DistributedEvent,
  ): Promise<void> {
    try {
      const message = JSON.stringify(event)
      await this.redis.publish(REDIS_PUBSUB_CHANNEL, message)
      if (event.clientId) {
        this.logger.log(`Published event for clientId: ${event.clientId}`)
      } else {
        this.logger.log('Published event for all clients')
      }
    } catch (error) {
      this.logger.error('Error publishing event:', error)
    }
  }
}
