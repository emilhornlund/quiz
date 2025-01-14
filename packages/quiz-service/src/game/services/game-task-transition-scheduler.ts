import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { Job, Queue } from 'bullmq'
import { Redis } from 'ioredis'

import { GameRepository } from './game.repository'
import { GameDocument, TaskType } from './models/schemas'
import {
  getQuestionTaskActiveDuration,
  getQuestionTaskPendingCallback,
  getQuestionTaskPendingDuration,
  leaderboardTaskCompletedCallback,
  lobbyTaskCompletedCallback,
  podiumTaskCompletedCallback,
  questionResultTaskCompletedCallback,
  questionTaskCompletedCallback,
} from './utils'

export const TASK_QUEUE_NAME = 'task'
const TASK_TRANSITION_JOB_NAME = TASK_QUEUE_NAME + 'transition'

type DelayHandler = ((gameDocument: GameDocument) => number) | number

// Transition handlers configuration for each task type and status
const TransitionHandlers: {
  [key in TaskType]: {
    [status in 'pending' | 'active' | 'completed']: {
      callback?: (gameDocument: GameDocument, redis: Redis) => Promise<void>
      delay?: DelayHandler
    }
  }
} = {
  [TaskType.Lobby]: {
    pending: {
      delay: 3000,
    },
    active: {},
    completed: {
      callback: lobbyTaskCompletedCallback,
      delay: 3000,
    },
  },
  [TaskType.Question]: {
    pending: {
      delay: getQuestionTaskPendingDuration,
      callback: getQuestionTaskPendingCallback,
    },
    active: {
      delay: getQuestionTaskActiveDuration,
    },
    completed: {
      callback: questionTaskCompletedCallback,
    },
  },
  [TaskType.QuestionResult]: {
    pending: {},
    active: {},
    completed: {
      callback: questionResultTaskCompletedCallback,
    },
  },
  [TaskType.Leaderboard]: {
    pending: {},
    active: {},
    completed: {
      callback: leaderboardTaskCompletedCallback,
    },
  },
  [TaskType.Podium]: {
    pending: {},
    active: {},
    completed: {
      callback: podiumTaskCompletedCallback,
    },
  },
  [TaskType.Quit]: {
    pending: {},
    active: {},
    completed: {},
  },
}

/**
 * Service responsible for managing task transitions within a game.
 * It schedules and performs transitions based on the current task type and status,
 * using configured handlers and delays for each transition.
 */
@Injectable()
@Processor(TASK_QUEUE_NAME)
export class GameTaskTransitionScheduler extends WorkerHost {
  private readonly logger = new Logger(GameTaskTransitionScheduler.name)

  /**
   * Constructs an instance of GameTaskTransitionScheduler.
   *
   * @param taskQueue - Task queue for scheduling deferred transitions.
   * @param gameRepository - Repository for accessing and modifying game data.
   * @param {Redis} redis - The Redis instance used for managing data synchronization and event handling.
   */
  constructor(
    @InjectQueue(TASK_QUEUE_NAME)
    private taskQueue: Queue<GameDocument, void, string>,
    private gameRepository: GameRepository,
    @InjectRedis()
    private readonly redis: Redis,
  ) {
    super()
  }

  /**
   * Initiates the scheduling process for transitioning the current task
   * of the provided game document based on its type and status.
   * Handles existing scheduled transitions appropriately.
   *
   * @param gameDocument - The game document containing the current task to transition.
   */
  public async scheduleTaskTransition(
    gameDocument: GameDocument,
  ): Promise<void> {
    const { currentTask } = gameDocument
    const { type, status } = currentTask

    const transitionConfig = TransitionHandlers[type]?.[status]
    if (!transitionConfig) {
      this.logger.error(
        `No transition configuration found for task type: ${type}, status: ${status} for Game ID: ${gameDocument._id}`,
      )
      return
    }

    const { delay: delayHandler, callback } = transitionConfig
    const nextStatus = GameTaskTransitionScheduler.getNextTaskStatus(status)

    this.logger.log(
      `Scheduling ${type} task transition from ${status} to ${nextStatus} for Game ID: ${gameDocument._id}`,
    )

    const jobId = GameTaskTransitionScheduler.getTransitionJobId(gameDocument)

    const existingTransitionJob = await this.taskQueue.getJob(jobId)
    if (existingTransitionJob) {
      if (status === 'active') {
        this.logger.debug(
          `Deleting existing timeout for task type ${type} and status ${status} for Game ID: ${gameDocument._id}`,
        )
        await this.taskQueue.remove(jobId)
        await this.performTransition(gameDocument, nextStatus, callback)
      } else {
        this.logger.warn(
          `Skipping scheduling task transition for task type: ${type}, status: ${status} for Game ID: ${gameDocument._id} since timeout exists`,
        )
        return
      }
    } else {
      const delay = GameTaskTransitionScheduler.getDelay(
        gameDocument,
        delayHandler,
      )

      if (delay > 0) {
        await this.scheduleDeferredTransition(
          gameDocument,
          delayHandler,
          nextStatus,
        )
      } else {
        await this.performTransition(gameDocument, nextStatus, callback)
      }
    }
  }

  /**
   * Schedules a task transition to occur after a specified delay.
   * It sets up a job that will trigger the transition after the delay.
   *
   * @param gameDocument - The current game document.
   * @param delayHandler - The delay in milliseconds or a function to compute the delay.
   * @param nextStatus - The status to transition to.
   *
   * @private
   */
  private async scheduleDeferredTransition(
    gameDocument: GameDocument,
    delayHandler: DelayHandler,
    nextStatus: 'active' | 'completed',
  ): Promise<void> {
    const { _id, currentTask } = gameDocument
    const { type, status } = currentTask

    const delay = GameTaskTransitionScheduler.getDelay(
      gameDocument,
      delayHandler,
    )

    this.logger.debug(
      `Scheduling deferred transition for task ${type} from status ${status} to ${nextStatus} with delay: ${delay}ms for Game ID: ${_id}`,
    )

    const jobId = GameTaskTransitionScheduler.getTransitionJobId(gameDocument)

    try {
      await this.taskQueue.add(TASK_TRANSITION_JOB_NAME, gameDocument, {
        jobId,
        delay,
        priority: delay ? 1 : 2,
      })
    } catch (error) {
      this.logger.error(
        `Failed to schedule deferred transition for task ${type} from status ${status} to ${nextStatus} for Game ID: ${_id}`,
        error,
      )
    }
  }

  /**
   * Executes the task transition by updating the game document to the next status,
   * and invoking the optional callback. It then triggers any post-transition logic.
   *
   * @param gameDocument - The game document to update.
   * @param nextStatus - The status to transition to.
   * @param callback - An optional callback function to execute during the transition.
   *
   * @private
   */
  private async performTransition(
    gameDocument: GameDocument,
    nextStatus: 'active' | 'completed' | undefined,
    callback?: (gameDocument: GameDocument, redis: Redis) => Promise<void>,
  ): Promise<void> {
    const { _id, currentTask } = gameDocument
    const { type, status } = currentTask

    this.logger.debug(
      `Performing transition for task ${type} from status ${status} to ${nextStatus} for Game ID: ${_id}`,
    )

    let updatedGameDocument: GameDocument | null = null

    try {
      updatedGameDocument = await this.gameRepository.findAndSaveWithLock(
        _id,
        async (doc) => {
          if (nextStatus) {
            doc.currentTask.status = nextStatus
          }
          if (callback) {
            await callback(doc, this.redis)
          }
          return doc
        },
      )

      this.logger.debug(
        `Successfully performed transition for task ${type} to status ${nextStatus} for Game ID: ${_id}`,
      )
    } catch (error) {
      this.logger.error(
        `Failed to perform transition for task ${type} from status ${status} to ${nextStatus} for Game ID: ${_id}`,
        error,
      )
    }

    if (updatedGameDocument) {
      if (
        nextStatus !== undefined &&
        updatedGameDocument.currentTask.status !== nextStatus
      ) {
        this.logger.warn(
          `Skipping post-transition actions since current status ${updatedGameDocument.currentTask.status} does not match expected status ${nextStatus} for Game ID: ${_id}`,
        )
        return
      }
      if (updatedGameDocument.currentTask.type === TaskType.Quit) {
        this.logger.warn(
          `Skipping post-transition actions since current type ${TaskType.Quit} for Game ID: ${_id}`,
        )
        return
      }
      await this.performPostTransition(updatedGameDocument)
    }
  }

  /**
   * Handles any logic that needs to occur after a task transition,
   * such as scheduling the next transition if required.
   *
   * @param gameDocument - The updated game document after the transition.
   *
   * @private
   */
  private async performPostTransition(
    gameDocument: GameDocument,
  ): Promise<void> {
    const { _id, currentTask } = gameDocument
    const { type, status } = currentTask

    this.logger.debug(
      `Performing post-transition actions for task ${type} with status ${status} for Game ID: ${_id}`,
    )

    const transitionConfig = TransitionHandlers[type]?.[status]
    if (!transitionConfig) {
      this.logger.error(
        `No transition configuration found for task type: ${type}, status: ${status} for Game ID: ${_id}`,
      )
      return
    }

    const delay = GameTaskTransitionScheduler.getDelay(
      gameDocument,
      transitionConfig.delay,
    )

    try {
      if (
        (status === 'active' && delay > 0) ||
        status === 'pending' ||
        status === 'completed'
      ) {
        this.logger.debug(
          `Scheduling next task transition for task ${type} with status ${status} for Game ID: ${_id}`,
        )
        await this.scheduleTaskTransition(gameDocument)
      }
    } catch (error) {
      this.logger.error(
        `Failed to perform post-transition actions for task ${type} with status ${status} for Game ID: ${_id}`,
        error,
      )
      throw error
    }
  }

  /**
   * A job consumer for scheduled deferred transitions.
   *
   * @param job - The scheduled transition job.
   */
  async process(job: Job<GameDocument, void, string>): Promise<void> {
    if (job.name === TASK_TRANSITION_JOB_NAME) {
      const gameDocument = job.data
      const { currentTask } = job.data
      const { type, status } = currentTask
      const nextStatus = GameTaskTransitionScheduler.getNextTaskStatus(status)

      try {
        const transitionConfig = TransitionHandlers[type]?.[status]
        if (!transitionConfig) {
          this.logger.error(
            `No transition configuration found for task type: ${type}, status: ${status} for Game ID: ${gameDocument._id}`,
          )
          return
        }

        const { callback } = transitionConfig

        this.logger.debug(
          `Executing timeout handler for task ${type} from status ${status} to ${nextStatus} for Game ID: ${gameDocument._id}`,
        )

        const latestGameDocument =
          await this.gameRepository.findGameByIDOrThrow(gameDocument._id)

        if (
          latestGameDocument.currentTask.type === type &&
          latestGameDocument.currentTask.status === status
        ) {
          const existingTransitionJob = await this.taskQueue.getJob(job.id)
          if (existingTransitionJob) {
            await this.taskQueue.remove(job.id)
          }
          await this.performTransition(gameDocument, nextStatus, callback)
        } else {
          this.logger.warn(
            `Skipping timeout handler since task type or status has changed for Game ID: ${gameDocument._id}`,
          )
        }
      } catch (error) {
        const existingTransitionJob = await this.taskQueue.getJob(job.id)
        if (existingTransitionJob) {
          await this.taskQueue.remove(job.id)
        }
        this.logger.error(
          `Error during scheduled deferred transition for task ${type} from status ${status} to ${nextStatus} for Game ID: ${gameDocument._id}`,
          error,
        )
      }
    }
    throw new Error('Method not implemented.')
  }

  /**
   * Generates a unique name for the transition job based on the task details.
   *
   * @param gameDocument - The game document to generate the transition job name for.
   *
   * @returns The unique transition job name string.
   *
   * @private
   */
  private static getTransitionJobId(gameDocument: GameDocument): string {
    const {
      currentTask: { _id, type, status },
    } = gameDocument
    return `transition-${_id}_${type}_${status}`
  }

  /**
   * Determines the next status for a task based on its current status.
   *
   * @param status - The current status of the task.
   *
   * @returns The next status ('active', 'completed', or undefined if no further transitions).
   *
   * @private
   */
  private static getNextTaskStatus(
    status: 'pending' | 'active' | 'completed',
  ): 'active' | 'completed' | undefined {
    switch (status) {
      case 'pending':
        return 'active'
      case 'active':
        return 'completed'
      case 'completed':
        return undefined
    }
  }

  /**
   * Calculates the delay value based on the provided delay handler.
   *
   * If the delay handler is a number, it returns the number directly.
   * If it's a function, it calls the function with the game document to compute the delay.
   *
   * @param gameDocument - The game document to be used when computing the delay.
   * @param delayHandler - A number or a function that returns a number.
   *
   * @returns The calculated delay in milliseconds.
   *
   * @private
   */
  private static getDelay(
    gameDocument: GameDocument,
    delayHandler?: DelayHandler,
  ): number {
    if (typeof delayHandler === 'function') {
      return Math.max(delayHandler(gameDocument) || 0, 0)
    }
    return Math.max(delayHandler || 0, 0)
  }
}
