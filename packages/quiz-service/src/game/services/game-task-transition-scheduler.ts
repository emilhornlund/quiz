import { Injectable, Logger } from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'

import { GameRepository } from './game.repository'
import { GameDocument, TaskType } from './models/schemas'
import {
  getQuestionTaskActiveDuration,
  getQuestionTaskPendingDuration,
  leaderboardTaskCompletedCallback,
  lobbyTaskCompletedCallback,
  questionResultTaskCompletedCallback,
  questionTaskCompletedCallback,
} from './utils'

type DelayHandler = { (gameDocument: GameDocument): number } | number

// Transition handlers configuration for each task type and status
const TransitionHandlers: {
  [key in TaskType]: {
    [status in 'pending' | 'active' | 'completed']: {
      callback?: (gameDocument: GameDocument) => void
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
    completed: {},
  },
}

/**
 * Service to handle task transitions in a game. Manages scheduling
 * and performing task transitions based on the current task type and status.
 */
@Injectable()
export class GameTaskTransitionScheduler {
  private readonly logger = new Logger(GameTaskTransitionScheduler.name)

  /**
   * Constructs an instance of GameTaskTransitionScheduler.
   *
   * @param {SchedulerRegistry} schedulerRegistry - The registry for scheduling and managing timeouts and intervals.
   * @param {GameRepository} gameRepository - Repository for accessing and modifying game data.
   */
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private gameRepository: GameRepository,
  ) {}

  /**
   * Schedules the transition of the current task based on its type and status.
   *
   * @param gameDocument - The current game document to be transitioned.
   */
  public async scheduleTaskTransition(
    gameDocument: GameDocument,
  ): Promise<void> {
    this.logger.debug(
      `Scheduling task transition for Game ID: ${gameDocument._id}`,
    )

    const { currentTask } = gameDocument
    const { type, status } = currentTask

    const transitionConfig = TransitionHandlers[type]?.[status]

    if (!transitionConfig) {
      this.logger.error(
        `No transition configuration found for task type: ${type}, status: ${status}`,
      )
      return
    }

    const { delay: delayHandler, callback } = transitionConfig
    const nextStatus = GameTaskTransitionScheduler.getNextTaskStatus(status)

    const delay = GameTaskTransitionScheduler.getDelay(
      gameDocument,
      delayHandler,
    )

    try {
      if (delay && delay > 0) {
        this.logger.log(
          `Scheduling deferred transition for Game ID: ${gameDocument._id}, delay: ${delay}ms`,
        )
        this.scheduleDeferredTransition(
          gameDocument,
          delay,
          nextStatus,
          callback,
        )
      } else {
        this.logger.log(
          `Performing immediate transition for Game ID: ${gameDocument._id}`,
        )
        await this.performTransition(gameDocument, nextStatus, callback)
      }
    } catch (error) {
      this.logger.error(
        `Failed to schedule task transition for Game ID: ${gameDocument._id}`,
        error,
      )
      throw error
    }
  }

  /**
   * Schedules a deferred task transition after a specified delay.
   *
   * @param gameDocument - The current game document.
   * @param delayHandler - The delay in milliseconds before the transition occurs.
   * @param nextStatus - The status to transition to.
   * @param callback - An optional callback to be executed during the transition.
   *
   * @private
   */
  private scheduleDeferredTransition(
    gameDocument: GameDocument,
    delayHandler: DelayHandler,
    nextStatus: 'pending' | 'active' | 'completed' | null,
    callback?: (gameDocument: GameDocument) => void,
  ): void {
    const delay = GameTaskTransitionScheduler.getDelay(
      gameDocument,
      delayHandler,
    )

    this.logger.debug(
      `Scheduling deferred ${gameDocument.currentTask.type} task transition (delay: ${delay}ms) for Game ID: ${gameDocument._id}`,
    )

    const transitionName = `transition-${gameDocument._id}-${Date.now()}`

    try {
      const timeout = setTimeout(async () => {
        try {
          await this.performTransition(gameDocument, nextStatus, callback)
        } catch (error) {
          this.logger.error(
            `Error during deferred ${gameDocument.currentTask.type} task transition for Game ID: ${gameDocument._id}`,
            error,
          )
          throw error
        } finally {
          this.schedulerRegistry.deleteTimeout(transitionName)
        }
      }, delay)

      this.schedulerRegistry.addTimeout(transitionName, timeout)
    } catch (error) {
      this.logger.error(
        `Failed to schedule deferred ${gameDocument.currentTask.type} task transition for Game ID: ${gameDocument._id}`,
        error,
      )
      throw error
    }
  }

  /**
   * Performs the task transition, updating the game document with the new status.
   *
   * @param gameDocument - The current game document.
   * @param nextStatus - The status to transition to.
   * @param callback - An optional callback to be executed during the transition.
   *
   * @private
   */
  private async performTransition(
    gameDocument: GameDocument,
    nextStatus: 'pending' | 'active' | 'completed' | null,
    callback?: (gameDocument: GameDocument) => void,
  ): Promise<void> {
    this.logger.debug(
      `Performing ${gameDocument.currentTask.type} task transition for Game ID: ${gameDocument._id}, next status: ${nextStatus}`,
    )

    try {
      const updatedGameDocument = await this.gameRepository.findAndSaveWithLock(
        gameDocument._id,
        (doc) => {
          this.logger.log(
            `Transitioning ${doc.currentTask.type} task from ${doc.currentTask.status} to ${nextStatus} (Game ID: ${doc._id})`,
          )

          if (nextStatus) {
            doc.currentTask.status = nextStatus
          }

          if (callback) {
            callback(doc)
          }

          return doc
        },
      )

      await this.handlePostTransition(updatedGameDocument)
    } catch (error) {
      this.logger.error(
        `Failed to perform ${gameDocument.currentTask.type} task transition for Game ID: ${gameDocument._id}`,
        error,
      )
      throw error
    }
  }

  /**
   * Handles post-transition logic, scheduling the next task transition if needed.
   *
   * @param gameDocument - The updated game document after the transition.
   *
   * @private
   */
  private async handlePostTransition(
    gameDocument: GameDocument,
  ): Promise<void> {
    const { currentTask } = gameDocument
    const { type, status } = currentTask

    this.logger.debug(
      `Handling ${type} task post-transition for Game ID: ${gameDocument._id}`,
    )

    try {
      if (status === 'pending' || status === 'completed') {
        this.logger.log(
          `Scheduling next ${type} task transition for Game ID: ${gameDocument._id}`,
        )
        await this.scheduleTaskTransition(gameDocument)
      } else if (status === 'active') {
        const { type } = currentTask
        const transitionConfig = TransitionHandlers[type]?.[status]

        const delay = GameTaskTransitionScheduler.getDelay(
          gameDocument,
          transitionConfig.delay,
        )

        if (delay > 0) {
          this.logger.log(
            `Scheduling transition for active ${type} task with delay for Game ID: ${gameDocument._id}`,
          )
          await this.scheduleTaskTransition(gameDocument)
        }
      }
    } catch (error) {
      this.logger.error(
        `Error during ${type} task post-transition handling for Game ID: ${gameDocument._id}`,
        error,
      )
      throw error
    }
  }

  /**
   * Determines the next status for the current task based on its current status.
   *
   * @param status - The current status of the task.
   *
   * @returns The next status ('active', 'completed', or null if no further transitions).
   *
   * @private
   */
  private static getNextTaskStatus(
    status: 'pending' | 'active' | 'completed',
  ): 'active' | 'completed' | null {
    switch (status) {
      case 'pending':
        return 'active'
      case 'active':
        return 'completed'
      case 'completed':
        return null
    }
  }

  /**
   * Resolves the delay value based on the provided handler.
   *
   * If the delay is a number, it is returned directly. If the delay is a function,
   * it is called with the game document to compute the delay.
   *
   * @param gameDocument - The game document used when evaluating the delay handler.
   * @param delayHandler - Either a numeric delay in milliseconds or a function that calculates the delay.
   *
   * @returns {number} The resolved delay in milliseconds.
   */
  private static getDelay(
    gameDocument: GameDocument,
    delayHandler?: DelayHandler,
  ): number | null {
    if (typeof delayHandler === 'function') {
      return delayHandler(gameDocument)
    }
    if (!!delayHandler && delayHandler > 0) {
      return delayHandler
    }
    return null
  }
}
