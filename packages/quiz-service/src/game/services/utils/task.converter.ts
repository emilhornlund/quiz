import { GameMode } from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import {
  BaseTask,
  GameDocument,
  LeaderboardTask,
  LeaderboardTaskItem,
  LobbyTask,
  Player,
  PodiumTask,
  QuestionResultTask,
  QuestionTask,
  TaskType,
} from '../models/schemas'

/**
 * Constructs a new lobby task with a unique ID, setting its initial status and creation timestamp.
 *
 * @returns {BaseTask & LobbyTask} A new lobby task object.
 */
export function buildLobbyTask(): BaseTask & LobbyTask {
  return {
    _id: uuidv4(),
    type: TaskType.Lobby,
    status: 'pending',
    created: new Date(),
  }
}

/**
 * Constructs a new question task with a unique ID, setting its initial status, creation timestamp, and question index.
 *
 * @param {GameDocument} gameDocument -
 *
 * @returns {BaseTask & QuestionTask} A new question task object.
 */
export function buildQuestionTask(
  gameDocument: GameDocument,
): BaseTask & QuestionTask {
  return {
    _id: uuidv4(),
    type: TaskType.Question,
    status: 'pending',
    questionIndex: gameDocument.nextQuestion,
    answers: [],
    created: new Date(),
  }
}

export function buildQuestionResultTask(
  gameDocument: GameDocument,
): BaseTask & QuestionResultTask {
  return {
    _id: uuidv4(),
    type: TaskType.QuestionResult,
    status: 'pending',
    questionIndex: gameDocument.nextQuestion - 1,
    results: [],
    created: new Date(),
  }
}

function compareSortClassicModePlayersByScore(
  lhs: Player,
  rhs: Player,
): number {
  if (lhs.totalScore < rhs.totalScore) {
    return 1
  }
  if (lhs.totalScore > rhs.totalScore) {
    return -1
  }
  return 0
}

function compareZeroToOneHundredModePlayersByScore(
  lhs: Player,
  rhs: Player,
): number {
  if (lhs.totalScore < rhs.totalScore) {
    return -1
  }
  if (lhs.totalScore > rhs.totalScore) {
    return 1
  }
  return 0
}

function buildLeaderboardItems(
  gameDocument: GameDocument,
): LeaderboardTaskItem[] {
  return gameDocument.players
    .sort((a, b) =>
      gameDocument.mode === GameMode.Classic
        ? compareSortClassicModePlayersByScore(a, b)
        : compareZeroToOneHundredModePlayersByScore(a, b),
    )
    .map((player, index) => ({
      playerId: player._id,
      nickname: player.nickname,
      position: index + 1,
      score: player.totalScore,
      streaks: player.currentStreak,
    }))
}

export function buildLeaderboardTask(
  gameDocument: GameDocument,
): BaseTask & LeaderboardTask {
  return {
    _id: uuidv4(),
    type: TaskType.Leaderboard,
    status: 'pending',
    questionIndex: gameDocument.nextQuestion - 1,
    leaderboard: buildLeaderboardItems(gameDocument),
    created: new Date(),
  }
}

export function buildPodiumTask(
  gameDocument: GameDocument,
): BaseTask & PodiumTask {
  return {
    _id: uuidv4(),
    type: TaskType.Podium,
    status: 'pending',
    leaderboard: buildLeaderboardItems(gameDocument),
    created: new Date(),
  }
}
