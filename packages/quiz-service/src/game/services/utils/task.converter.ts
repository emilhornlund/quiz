import { GameMode } from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import { IllegalTaskTypeException } from '../../exceptions'
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

import { isQuestionResultTask, isQuestionTask } from './task.utils'

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
 * Constructs a new question task based on the provided game document.
 *
 * @param {GameDocument} gameDocument - The current game document.
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

/**
 * Constructs a new question result task based on the provided game document.
 *
 * @param {GameDocument} gameDocument - The current game document.
 *
 * @throws {IllegalTaskTypeException} If the current task type is not a question.
 *
 * @returns {BaseTask & QuestionResultTask} A new question result task object.
 */
export function buildQuestionResultTask(
  gameDocument: GameDocument,
): BaseTask & QuestionResultTask {
  if (!isQuestionTask(gameDocument)) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.Question,
    )
  }
  return {
    _id: uuidv4(),
    type: TaskType.QuestionResult,
    status: 'pending',
    questionIndex: gameDocument.nextQuestion - 1,
    results: [],
    created: new Date(),
  }
}

/**
 * Compares two players based on their total score in Classic mode.
 *
 * @param {Player} lhs - The left-hand side player.
 * @param {Player} rhs - The right-hand side player.
 *
 * @returns {number} The comparison result for sorting.
 */
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

/**
 * Compares two players based on their total score in ZeroToOneHundred mode.
 *
 * @param {Player} lhs - The left-hand side player.
 * @param {Player} rhs - The right-hand side player.
 *
 * @returns {number} The comparison result for sorting.
 */
function compareZeroToOneHundredModePlayersByScore(
  lhs: Player,
  rhs: Player,
): number {
  return compareSortClassicModePlayersByScore(lhs, rhs) * -1 //sort scores from lowest to highest
}

/**
 * Builds leaderboard items for the current game document, sorting players by score based on the game mode.
 *
 * @param {GameDocument} gameDocument - The current game document.
 *
 * @returns {LeaderboardTaskItem[]} An array of leaderboard task items.
 */
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

/**
 * Constructs a new leaderboard task based on the provided game document.
 *
 * @param {GameDocument} gameDocument - The current game document.
 *
 * @throws {IllegalTaskTypeException} If the current task type is not a question result.
 *
 * @returns {BaseTask & LeaderboardTask} A new leaderboard task object.
 */
export function buildLeaderboardTask(
  gameDocument: GameDocument,
): BaseTask & LeaderboardTask {
  if (!isQuestionResultTask(gameDocument)) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.QuestionResult,
    )
  }
  return {
    _id: uuidv4(),
    type: TaskType.Leaderboard,
    status: 'pending',
    questionIndex: gameDocument.nextQuestion - 1,
    leaderboard: buildLeaderboardItems(gameDocument),
    created: new Date(),
  }
}

/**
 * Constructs a new podium task based on the provided game document.
 *
 * @param {GameDocument} gameDocument - The current game document.
 *
 * @throws {IllegalTaskTypeException} If the current task type is not a question result.
 *
 * @returns {BaseTask & PodiumTask} A new podium task object.
 */
export function buildPodiumTask(
  gameDocument: GameDocument,
): BaseTask & PodiumTask {
  if (!isQuestionResultTask(gameDocument)) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.QuestionResult,
    )
  }
  return {
    _id: uuidv4(),
    type: TaskType.Podium,
    status: 'pending',
    leaderboard: buildLeaderboardItems(gameDocument),
    created: new Date(),
  }
}
