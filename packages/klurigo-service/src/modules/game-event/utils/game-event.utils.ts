import {
  GameParticipantType,
  QuestionType,
  SubmitQuestionAnswerRequestDto,
} from '@klurigo/common'

import {
  Participant,
  ParticipantPlayerWithBase,
  QuestionTaskAnswer,
} from '../../game-core/repositories/models/schemas'
import { GameEventMetaData } from '../models'

/**
 * Converts a player's submitted answer into a question task answer format.
 *
 * This function takes the player ID and the submitted answer data, and returns a
 * properly formatted answer object based on the question type. It supports multiple
 * question types, including multi-choice, range, true/false, and type answer.
 *
 * @param playerId - The unique identifier of the player submitting the answer.
 * @param submitQuestionAnswerRequest - The answer data
 * from the player, including the answer type and value.
 *
 * @returns {QuestionTaskAnswer} The formatted answer object for the current question.
 *
 * @private
 */
export function toQuestionTaskAnswer(
  playerId: string,
  submitQuestionAnswerRequest: SubmitQuestionAnswerRequestDto,
): QuestionTaskAnswer {
  const { type } = submitQuestionAnswerRequest

  let answer: string | string[] | number | boolean

  if (type === QuestionType.MultiChoice) {
    answer = submitQuestionAnswerRequest.optionIndex
  } else if (
    type === QuestionType.Range ||
    type === QuestionType.TrueFalse ||
    type === QuestionType.TypeAnswer
  ) {
    answer = submitQuestionAnswerRequest.value
  } else if (type === QuestionType.Pin) {
    answer = `${submitQuestionAnswerRequest.positionX},${submitQuestionAnswerRequest.positionY}`
  } else if (type === QuestionType.Puzzle) {
    answer = submitQuestionAnswerRequest.values
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error(`Unsupported question type '${type as any}'`)
  }

  return {
    type,
    playerId,
    answer,
    created: new Date(),
  }
}

/**
 * Computes game event metadata related to answer submissions for the current question.
 *
 * The function populates:
 * - `currentAnswerSubmissions` based on the number of stored answers.
 * - `totalAnswerSubmissions` based on the number of player participants (host excluded).
 *
 * @param answers - Answers currently submitted for the active question.
 * @param metaData - Existing metadata to merge into.
 * @param participants - All game participants used to compute total expected submissions.
 * @returns Merged metadata including submission counters.
 */

export function toGameEventMetaData(
  answers: QuestionTaskAnswer[],
  metaData: Partial<GameEventMetaData>,
  participants: Participant[],
): Partial<GameEventMetaData> {
  return {
    ...metaData,
    currentAnswerSubmissions: answers.length,
    totalAnswerSubmissions: participants.filter(
      (participant) => participant.type === GameParticipantType.PLAYER,
    ).length,
  }
}

/**
 * Builds metadata for a player-specific question event based on existing answers.
 *
 * @param answers - The list of answers submitted for the current question task.
 * @param participant - The participant for whom the metadata is generated.
 *
 * @returns Metadata indicating the participant's submitted answer.
 */
export function toPlayerQuestionPlayerEventMetaData(
  answers: QuestionTaskAnswer[],
  participant: ParticipantPlayerWithBase,
): Partial<GameEventMetaData> {
  const playerAnswerSubmission = answers?.find(
    (answer) => answer.playerId === participant.participantId,
  )

  return {
    playerAnswerSubmission,
  }
}
