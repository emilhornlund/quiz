import { v4 as uuidv4 } from 'uuid'

import {
  QuitTaskWithBase,
  TaskType,
} from '../../game-core/repositories/models/schemas'

/**
 * Constructs a new quit task, setting its initial status and creation timestamp.
 *
 * @returns A new quit task object.
 */
export function buildQuitTask(): QuitTaskWithBase {
  return {
    _id: uuidv4(),
    type: TaskType.Quit,
    status: 'completed',
    created: new Date(),
  }
}
