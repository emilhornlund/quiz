import { v4 as uuidv4 } from 'uuid'

import {
  LobbyTaskWithBase,
  TaskType,
} from '../../game-core/repositories/models/schemas'

/**
 * Constructs a new lobby task with a unique ID, setting its initial status and creation timestamp.
 *
 * @returns A new lobby task object.
 */
export function buildLobbyTask(): LobbyTaskWithBase {
  return {
    _id: uuidv4(),
    type: TaskType.Lobby,
    status: 'pending',
    created: new Date(),
  }
}
