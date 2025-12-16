import {
  GameDocument,
  LeaderboardTaskItem,
} from '../../../../game-core/repositories/models/schemas'

/**
 * Builds a leaderboard array from the game's current task, limited to top 5 players.
 *
 * @param game - The game document containing the current task with leaderboard data.
 * @returns An array of leaderboard items limited to 5 entries.
 */
export function buildLeaderboardFromGame(
  game: GameDocument & {
    currentTask: { leaderboard: LeaderboardTaskItem[] }
  },
): LeaderboardTaskItem[] {
  return game.currentTask.leaderboard.slice(0, 5)
}

/**
 * Creates a leaderboard entry for the host event with all player details.
 *
 * @param item - The leaderboard task item.
 * @returns A formatted leaderboard entry for host events.
 */
export function createLeaderboardHostEntry(item: LeaderboardTaskItem) {
  const { position, previousPosition, nickname, score, streaks } = item
  return {
    position,
    previousPosition,
    nickname,
    score,
    streaks,
  }
}

/**
 * Creates a leaderboard entry for the podium event with essential details only.
 *
 * @param item - The leaderboard task item.
 * @returns A formatted leaderboard entry for podium events.
 */
export function createPodiumEntry(item: LeaderboardTaskItem) {
  const { position, nickname, score } = item
  return {
    position,
    nickname,
    score,
  }
}
