import { Injectable, Logger } from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { GameParticipantType } from '@quiz/common'
import { Redis } from 'ioredis'

import { DistributedEvent } from './models/event'
import { GameDocument } from './models/schemas'
import { buildHostGameEvent, buildPlayerGameEvent } from './utils'

const REDIS_PUBSUB_CHANNEL = 'events'

/**
 * GameEventPublisher is responsible for broadcasting game events to connected clients
 * using Redis Pub/Sub for distributed event handling.
 */
@Injectable()
export class GameEventPublisher {
  private readonly logger = new Logger(GameEventPublisher.name)

  /**
   * Constructs an instance of GameEventPublisher.
   *
   * @param {Redis} redis - Redis instance for Pub/Sub operations.
   */
  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Publishes game events to relevant clients for a given game document.
   *
   * @param {GameDocument} document - The game document whose events are to be published.
   *
   * @returns {Promise<void>} A promise that resolves once the events are published.
   */
  public async publish(document: GameDocument): Promise<void> {
    await Promise.all(
      document.participants.map(
        (participant) =>
          ({
            clientId: participant.client.player._id,
            event:
              participant.type === GameParticipantType.HOST
                ? buildHostGameEvent(document)
                : buildPlayerGameEvent(document, participant),
          }) as DistributedEvent,
      ),
    )
  }

  /**
   * Publishes a distributed event to the Redis Pub/Sub channel.
   *
   * @param {DistributedEvent} event - The event to be published.
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
