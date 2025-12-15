import { Injectable } from '@nestjs/common'

import {
  GameDocument,
  LeaderboardTaskItem,
  LeaderboardTaskWithBase,
  LobbyTaskWithBase,
  PodiumTaskWithBase,
  QuestionResultTaskWithBase,
  QuestionTaskWithBase,
  QuitTaskWithBase,
} from '../../repositories/models/schemas'

import { GameTaskOrchestrator as IGameTaskOrchestrator } from './game-task-orchestrator.interface'
import {
  buildLeaderboardTask,
  buildLobbyTask,
  buildPodiumTask,
  buildQuestionResultTask,
  buildQuestionTask,
  buildQuitTask,
  rebuildQuestionResultTask,
  updateParticipantsAndBuildLeaderboard,
} from './utils'

@Injectable()
export class GameTaskOrchestrator implements IGameTaskOrchestrator {
  /**
   * Constructs a new lobby task with a unique ID, setting its initial status and creation timestamp.
   *
   * @returns A new lobby task object.
   */
  public buildLobbyTask(): LobbyTaskWithBase {
    return buildLobbyTask()
  }

  /**
   * Constructs a new question task based on the provided game document.
   *
   * @param gameDocument - The current game document.
   *
   * @returns A new question task object.
   */
  public buildQuestionTask(gameDocument: GameDocument): QuestionTaskWithBase {
    return buildQuestionTask(gameDocument)
  }

  /**
   * Constructs a new `QuestionResultTask` based on the current active question task.
   *
   * This function is typically used during normal gameplay after a question is completed.
   * It evaluates all player answers, calculates scores and correctness, and assigns positions.
   * The task includes the correct answers and is ready to be emitted or persisted.
   *
   * @param gameDocument - The current game state containing the active question task and answers.
   * @returns A fully populated `QuestionResultTask` with correct answers and scored results.
   *
   * @throws {IllegalTaskTypeException} If the current task is not of type `Question`.
   */
  public buildQuestionResultTask(
    gameDocument: GameDocument,
  ): QuestionResultTaskWithBase {
    return buildQuestionResultTask(gameDocument)
  }

  /**
   * Recomputes the `results` of an existing `QuestionResultTask` using data from the preceding `Question` task.
   *
   * This function is useful when needing to restore or recalculate results from a previously created result task.
   * It uses the preserved correct answers and answers from the previous task to regenerate the final result items.
   *
   * @param gameDocument - The game document where the current task is of type `QuestionResult`
   *                       and the previous task is of type `Question`.
   * @returns A `QuestionResultTask` with newly rebuilt results while preserving task metadata.
   *
   * @throws {IllegalTaskTypeException} If the current task is not a `QuestionResult` or the previous task is not a `Question`.
   */
  public rebuildQuestionResultTask(
    gameDocument: GameDocument,
  ): QuestionResultTaskWithBase {
    return rebuildQuestionResultTask(gameDocument)
  }

  /**
   * Updates all player participants with their latest result data and generates
   * the leaderboard for the current question result task.
   *
   * The function:
   * - Reads each player's previous rank (if any).
   * - Applies the new score, streak, and position from the current task results.
   * - Sorts players by their current rank.
   * - Produces leaderboard entries that include both current and previous positions.
   *
   * @param gameDocument - The current game document containing a QuestionResult task.
   *
   * @returns A list of leaderboard task items reflecting updated ranks, scores, and streaks.
   */
  public updateParticipantsAndBuildLeaderboard(
    gameDocument: GameDocument,
  ): LeaderboardTaskItem[] {
    return updateParticipantsAndBuildLeaderboard(gameDocument)
  }

  /**
   * Constructs a new leaderboard task based on the provided game document.
   *
   * @param gameDocument - The current game document.
   * @param leaderboard - A list of leaderboard task items reflecting updated ranks, scores, and streaks.
   *
   * @throws {IllegalTaskTypeException} If the current task type is not a question result.
   *
   * @returns A new leaderboard task object.
   */
  public buildLeaderboardTask(
    gameDocument: GameDocument,
    leaderboard: LeaderboardTaskItem[],
  ): LeaderboardTaskWithBase {
    return buildLeaderboardTask(gameDocument, leaderboard)
  }

  /**
   * Constructs a new podium task based on the provided game document.
   *
   * @param gameDocument - The current game document.
   * @param leaderboard - A list of leaderboard task items reflecting updated ranks, scores, and streaks.
   *
   * @throws {IllegalTaskTypeException} If the current task type is not a question result.
   *
   * @returns A new podium task object.
   */
  public buildPodiumTask(
    gameDocument: GameDocument,
    leaderboard: LeaderboardTaskItem[],
  ): PodiumTaskWithBase {
    return buildPodiumTask(gameDocument, leaderboard)
  }

  /**
   * Constructs a new quit task, setting its initial status and creation timestamp.
   *
   * @returns A new quit task object.
   */
  public buildQuitTask(): QuitTaskWithBase {
    return buildQuitTask()
  }
}
