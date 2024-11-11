import { Injectable, Logger } from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'

import { GameRepository } from './game.repository'
import { GameDocument, TaskType } from './models/schemas'

// Transition handlers configuration for each task type and status
const TransitionHandlers: {
  [key in TaskType]: {
    [key in 'pending' | 'active']: {
      callback?: (gameDocument: GameDocument) => GameDocument
      duration?: number
    }
  }
} = {
  [TaskType.Lobby]: {
    pending: {
      duration: 3000,
    },
    active: {
      callback: (gameDocument: GameDocument) => {
        // TODO: Implement logic for the next question task
        return gameDocument
      },
      duration: 3000,
    },
  },
  [TaskType.Question]: {
    pending: {},
    active: {},
  },
}

/**
 * Service for managing game task transitions by scheduling transitions between
 * different statuses (e.g., 'pending' to 'active') for various task types.
 * This service utilizes `SchedulerRegistry` to handle delayed or immediate transitions.
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
   * Schedules the transition for the current task within a game.
   *
   * @param {GameDocument} gameDocument - The document representing the current state of the game.
   * @returns {Promise<void>} A promise that resolves when the scheduling is complete.
   */
  public async scheduleTaskTransition(
    gameDocument: GameDocument,
  ): Promise<void> {
    const { type, status } = gameDocument.currentTask

    if (status === 'completed') {
      this.logger.error(
        `Attempted to schedule a transition for a completed task (Game ID: ${gameDocument._id}, Task Type: ${type})`,
      )
      throw new Error('Invalid task status transition')
    }

    const transitionName = `transition-${gameDocument._id}`

    if (this.schedulerRegistry.doesExist('timeout', transitionName)) {
      this.schedulerRegistry.deleteTimeout(transitionName)
    }

    const { callback, duration } = TransitionHandlers[type]?.[status] ?? {}

    /**
     * Executes an immediate transition and updates the game document status if needed.
     *
     * @param {('active' | 'completed')} [status] - The status to update the task to.
     * @param {(gameDocument: GameDocument) => GameDocument} [callback] - An optional callback to modify the game document.
     * @returns {Promise<void>} A promise that resolves when the immediate transition handler is complete.
     */
    const immediateHandler = async (
      status?: 'active' | 'completed',
      callback?: (gameDocument: GameDocument) => GameDocument,
    ): Promise<void> => {
      try {
        this.logger.debug(
          `Starting immediateHandler for Game ID: ${gameDocument._id}`,
        )
        await this.gameRepository.findAndSave(
          gameDocument._id,
          (gameDocument: GameDocument) => {
            if (status) {
              this.logger.log(
                `Transitioning task status from ${gameDocument.currentTask.status} to ${status} (Game ID: ${gameDocument._id})`,
              )
              gameDocument.currentTask.status = status
            }
            if (callback) {
              this.logger.log(
                `Executing transition callback for task status ${gameDocument.currentTask.status} (Game ID: ${gameDocument._id})`,
              )
              return callback(gameDocument)
            }
            return gameDocument
          },
        )
        this.logger.debug(
          `Completed immediateHandler for Game ID: ${gameDocument._id}`,
        )
      } catch (error) {
        this.logger.error('Error executing transition', error)
        throw error
      }
    }

    /**
     * Schedules a deferred transition to be executed after a specified duration.
     *
     * @param {number} duration - The duration to wait before executing the transition (in milliseconds).
     * @param {('active' | 'completed')} [status] - The status to update the task to after the delay.
     * @param {(gameDocument: GameDocument) => GameDocument} [callback] - An optional callback to modify the game document.
     * @returns {Promise<void>} A promise that resolves when the deferred transition handler is complete.
     */
    const deferredHandler = async (
      duration: number,
      status?: 'active' | 'completed',
      callback?: (gameDocument: GameDocument) => GameDocument,
    ): Promise<void> => {
      this.logger.debug(
        `Scheduling deferredHandler for Game ID: ${gameDocument._id} with duration: ${duration} ms`,
      )

      const handler = async () => {
        try {
          this.logger.log(
            `Executing deferredHandler for Game ID: ${gameDocument._id} (Transition: ${status})`,
          )
          await immediateHandler(status, callback)
        } catch (error) {
          this.logger.error(
            `Error in deferredHandler execution for Game ID: ${gameDocument._id} (Transition: ${status})`,
            error,
          )
          throw error
        } finally {
          this.schedulerRegistry.deleteTimeout(transitionName)
          this.logger.log(
            `Completed deferredHandler and removed timeout for Game ID: ${gameDocument._id} (Name: ${transitionName})`,
          )
        }
      }
      const timeout = setTimeout(handler, duration)
      this.schedulerRegistry.addTimeout(transitionName, timeout)
    }

    if (status === 'pending') {
      if (duration) {
        this.logger.log(
          `Scheduling task transition from pending to active for Game ID: ${gameDocument._id} with delay`,
        )
        await deferredHandler(duration, 'active', callback)
      } else {
        this.logger.log(
          `Executing immediate task transition from pending to active for Game ID: ${gameDocument._id}`,
        )
        await immediateHandler('active', callback)
      }
    }

    if (status === 'active') {
      if (duration) {
        this.logger.log(
          `Executing immediate transition to completed and scheduling next task for Game ID: ${gameDocument._id}`,
        )
        await immediateHandler('completed')
        await deferredHandler(duration, null, callback)
      } else {
        this.logger.log(
          `Executing immediate transition to completed for Game ID: ${gameDocument._id}`,
        )
        await immediateHandler('completed', callback)
      }
    }
  }
}
