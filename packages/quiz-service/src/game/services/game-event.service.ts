import {
  Injectable,
  Logger,
  MessageEvent,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { GameEventType } from '@quiz/common'
import { Redis } from 'ioredis'
import { HydratedDocument, Model } from 'mongoose'
import { concat, finalize, from, fromEvent, Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

import { ActiveGameNotFoundByIDException } from '../exceptions'

import { DistributedEvent } from './models/event'
import { Game } from './models/schemas'
import {
  toDistributedEvent,
  toDistributedHostGameEvent,
  toDistributedPlayerGameEvent,
} from './utils'

const REDIS_PUBSUB_CHANNEL = 'events'
const LOCAL_EVENT_EMITTER_CHANNEL = 'event'

/**
 * The `GameEventService` manages event-based messaging between clients
 * using Redis Pub/Sub for distributed communication and EventEmitter for local
 * Server-Sent Events (SSE) broadcasting. This service emits periodic heartbeat
 * events and specific game events to connected clients, supporting both
 * individual client-targeted events and broadcast events.
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
   * @param redis - Redis instance for Pub/Sub operations.
   * @param gameModel - Mongoose model representing the Game schema.
   * @param eventEmitter - EventEmitter2 instance for in-app event broadcasting.
   */
  constructor(
    @InjectRedis() private readonly redis: Redis,
    @InjectModel(Game.name) private gameModel: Model<Game>,
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
   * @param event - The event to emit, which can be a heartbeat or specific game event.
   * @private
   */
  private emitEvent(event: DistributedEvent) {
    this.eventEmitter.emit(LOCAL_EVENT_EMITTER_CHANNEL, event)
  }

  /**
   * Subscribes a client to receive SSE events, filtering messages based on the client ID.
   * Heartbeat events are sent to all clients, while game events target specific clients.
   *
   * @param gameID - The ID of the game to subscribe to.
   * @param clientId - Unique identifier of the subscribing client.
   * @returns An Observable of `MessageEvent` objects for SSE consumption.
   */
  public async subscribe(
    gameID: string,
    clientId: string,
  ): Promise<Observable<MessageEvent>> {
    const document = await this.gameModel.findOne({
      _id: gameID,
      created: { $gt: new Date(Date.now() - 6 * 60 * 60 * 1000) },
    })

    if (!document) {
      throw new ActiveGameNotFoundByIDException(gameID)
    }

    if (!this.activeClients.has(clientId)) {
      this.activeClients.add(clientId)
    }

    const source = fromEvent(
      this.eventEmitter,
      LOCAL_EVENT_EMITTER_CHANNEL,
    ) as Observable<DistributedEvent>

    return concat(from([toDistributedEvent(document, clientId)]), source).pipe(
      filter(
        (event) => event.clientId === undefined || event.clientId === clientId,
      ),
      map((event) => ({ data: JSON.stringify(event.event) })),
      finalize(() => this.activeClients.delete(clientId)),
    )
  }

  /**
   * Publishes a game event to all relevant clients via Redis and internal event handling,
   * including host and player-specific events.
   *
   * @param document - Mongoose document of the game to publish events for.
   */
  public async publish(document: HydratedDocument<Game>): Promise<void> {
    await Promise.all([
      this.publishDistributedEvent(toDistributedHostGameEvent(document)),
      ...document.players.map((player) =>
        toDistributedPlayerGameEvent(document, player),
      ),
    ])
  }

  /**
   * Publishes a distributed event via Redis, logging its status.
   * If `clientId` is specified, the event targets a specific client; otherwise,
   * it is broadcasted to all subscribed clients.
   *
   * @param event - The distributed event to be published to Redis.
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
