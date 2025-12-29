import { QuestionTaskAnswer } from '../../game-core/repositories/models/schemas'

/**
 * Metadata associated with game utils, used to track answer submissions and player-specific information.
 */
export interface GameEventMetaData {
  currentAnswerSubmissions: number
  totalAnswerSubmissions: number
  playerAnswerSubmission?: QuestionTaskAnswer
}
