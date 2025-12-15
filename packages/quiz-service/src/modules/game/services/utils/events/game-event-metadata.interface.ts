import { QuestionTaskAnswer } from '../../../repositories/models/schemas'

/**
 * Metadata associated with game events, used to track answer submissions and player-specific information.
 */
export interface GameEventMetaData {
  currentAnswerSubmissions: number
  totalAnswerSubmissions: number
  playerAnswerSubmission?: QuestionTaskAnswer
}
