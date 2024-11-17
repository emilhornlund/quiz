import { v4 as uuidv4 } from 'uuid'

import {
  BaseTask,
  GameDocument,
  LeaderboardTask,
  LobbyTask,
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

export function buildLeaderboardTask(
  gameDocument: GameDocument,
): BaseTask & LeaderboardTask {
  return {
    _id: uuidv4(),
    type: TaskType.Leaderboard,
    status: 'pending',
    questionIndex: gameDocument.nextQuestion - 1,
    leaderboard: [],
    created: new Date(),
  }
}

export function buildPodiumTask(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  gameDocument: GameDocument,
): BaseTask & PodiumTask {
  return {
    _id: uuidv4(),
    type: TaskType.Podium,
    status: 'pending',
    leaderboard: [],
    created: new Date(),
  }
}
