import { Injectable, Logger } from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'

import { GameRepository } from './game.repository'
import { GameDocument, TaskType } from './models/schemas'

/**
 * Service for handling scheduled tasks within the game lifecycle.
 */
@Injectable()
export class GameScheduler {
  private readonly logger = new Logger(GameScheduler.name)

  /**
   * Constructs an instance of GameScheduler.
   *
   * @param {SchedulerRegistry} schedulerRegistry - The registry for scheduling and managing timeouts and intervals.
   * @param {GameRepository} gameRepository - Repository for accessing and modifying game data.
   */
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private gameRepository: GameRepository,
  ) {}

  /**
   * Schedules a transition for a lobby task from 'pending' to 'active' state.
   *
   * @param {GameDocument} gameDocument - The game document containing the task to be scheduled.
   * @returns {Promise<void>} A promise that resolves when the scheduling is complete.
   */
  public async schedulePendingActiveTransitionLobbyTask(
    gameDocument: GameDocument,
  ): Promise<void> {
    const { type, status } = gameDocument.currentTask

    const name = GameScheduler.getCurrentTaskName(gameDocument)

    if (type === TaskType.Lobby && status === 'pending') {
      this.logger.log(
        `Adding scheduled pending to active lobby task transition`,
      )

      const callback = async () => {
        await this.gameRepository.findAndSave(
          gameDocument._id,
          (currentDocument) => {
            currentDocument.currentTask.status = 'active'
            return currentDocument
          },
        )
        this.schedulerRegistry.deleteTimeout(name)
      }

      const timeout = setTimeout(callback, 3000)
      this.schedulerRegistry.addTimeout(name, timeout)
    } else {
      this.logger.warn(
        `Invalid type '${type} or '${status}' in scheduled pending to active lobby task transition`,
      )
    }
  }

  /**
   * Generates a unique name for the current task in a game document.
   *
   * @param {GameDocument} gameDocument - The game document containing the task.
   * @returns {string} A string representing the task name.
   * @private
   */
  private static getCurrentTaskName(gameDocument: GameDocument): string {
    const { type, status } = gameDocument.currentTask
    return `${gameDocument._id}-${type}-${status}`
  }
}
