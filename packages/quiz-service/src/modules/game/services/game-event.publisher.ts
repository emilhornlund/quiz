import { Injectable, Logger } from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { GameEvent, GameParticipantType } from '@quiz/common'
import { Redis } from 'ioredis'

import {
  GameDocument,
  Participant,
  TaskType,
} from '../../game-core/repositories/models/schemas'
import { GameEventOrchestrator } from '../orchestration/event'

import { DistributedEvent } from './models/event'
import { getRedisPlayerParticipantAnswerKey } from './utils'

const REDIS_PUBSUB_CHANNEL = 'events'

/**
 * GameEventPublisher is responsible for broadcasting game events to connected players
 * using Redis Pub/Sub for distributed event handling.
 */
@Injectable()
export class GameEventPublisher {
  private readonly logger = new Logger(GameEventPublisher.name)

  /**
   * Constructs an instance of GameEventPublisher.
   *
   * @param {Redis} redis - Redis instance for Pub/Sub operations.
   * @param gameEventOrchestrator - Orchestrator for building game events.
   */
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private gameEventOrchestrator: GameEventOrchestrator,
  ) {}

  /**
   * Publishes game events to relevant players for a given game document.
   *
   * @param {GameDocument} document - The game document whose events are to be published.
   *
   * @returns {Promise<void>} A promise that resolves once the events are published.
   */
  public async publish(document: GameDocument): Promise<void> {
    const [answers, metaData] =
      this.gameEventOrchestrator.toBaseQuestionTaskEventMetaDataTuple(
        await this.redis.lrange(
          getRedisPlayerParticipantAnswerKey(document._id),
          0,
          -1,
        ),
        {},
        document.participants,
      )

    await Promise.all(
      document.participants.map((participant) => {
        try {
          this.publishParticipantEvent(
            participant,
            participant.type === GameParticipantType.HOST
              ? this.gameEventOrchestrator.buildHostGameEvent(
                  document,
                  metaData,
                )
              : this.gameEventOrchestrator.buildPlayerGameEvent(
                  document,
                  participant,
                  {
                    ...metaData,
                    ...(document.currentTask.type === TaskType.Question
                      ? this.gameEventOrchestrator.toPlayerQuestionPlayerEventMetaData(
                          answers,
                          participant,
                        )
                      : {}),
                  },
                ),
          )
        } catch (error) {
          const { message, stack } = error as Error
          this.logger.warn(
            `Error publishing event for participant ${participant.participantId}: ${message}`,
            stack,
          )
        }
      }),
    )
  }

  /**
   * Publishes a game event for a specified participant.

   * @param {Participant} participant - The participant for whom the event published for.
   * @param {GameEvent} event - The event to be published.
   *
   * @returns {Promise<void>} A promise that resolves once the event is published.
   */
  public async publishParticipantEvent(
    participant: Participant,
    event?: GameEvent,
  ): Promise<void> {
    if (!event) return Promise.resolve()

    return this.publishDistributedEvent({
      playerId: participant.participantId,
      event,
    })
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
      if (event.playerId) {
        this.logger.log(`Published event for playerId: ${event.playerId}`)
      } else {
        this.logger.log('Published event for all players')
      }
    } catch (error) {
      this.logger.error('Error publishing event:', error)
    }
  }
}
