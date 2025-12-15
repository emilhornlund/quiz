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

export interface GameTaskOrchestrator {
  /**
   * Builds the initial Lobby task for a newly created game.
   *
   * @returns A new `LobbyTaskWithBase` task.
   */
  buildLobbyTask(): LobbyTaskWithBase

  /**
   * Builds the next Question task for the provided game document.
   *
   * @param gameDocument - The current game state used to derive the next question.
   * @returns A new `QuestionTaskWithBase` task.
   */
  buildQuestionTask(gameDocument: GameDocument): QuestionTaskWithBase

  /**
   * Builds a QuestionResult task for the current question, using the game document state.
   *
   * @param gameDocument - The current game state containing the completed question and answers.
   * @returns A new `QuestionResultTaskWithBase` task.
   */
  buildQuestionResultTask(
    gameDocument: GameDocument,
  ): QuestionResultTaskWithBase

  /**
   * Updates participants with the latest result state and produces leaderboard entries.
   *
   * @param gameDocument - The current game state containing a `QuestionResult` task.
   * @returns Leaderboard entries including current and previous positions.
   */
  updateParticipantsAndBuildLeaderboard(
    gameDocument: GameDocument,
  ): LeaderboardTaskItem[]

  /**
   * Builds a Leaderboard task from the given leaderboard entries.
   *
   * @param gameDocument - The current game state used for validation and context.
   * @param leaderboard - Computed leaderboard items for the task.
   * @returns A new `LeaderboardTaskWithBase` task.
   */
  buildLeaderboardTask(
    gameDocument: GameDocument,
    leaderboard: LeaderboardTaskItem[],
  ): LeaderboardTaskWithBase

  /**
   * Builds a Podium task from the final leaderboard entries.
   *
   * @param gameDocument - The current game state used for validation and context.
   * @param leaderboard - Computed leaderboard items used to determine podium placements.
   * @returns A new `PodiumTaskWithBase` task.
   */
  buildPodiumTask(
    gameDocument: GameDocument,
    leaderboard: LeaderboardTaskItem[],
  ): PodiumTaskWithBase

  /**
   * Builds the Quit task used to finalize the game.
   *
   * @returns A new `QuitTaskWithBase` task.
   */
  buildQuitTask(): QuitTaskWithBase
}
