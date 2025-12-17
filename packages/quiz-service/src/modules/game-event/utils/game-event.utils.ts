import {
  GameParticipantType,
  QuestionType,
  SubmitQuestionAnswerRequestDto,
} from '@quiz/common'

import {
  Participant,
  ParticipantPlayerWithBase,
  QuestionTaskAnswer,
  QuestionTaskBaseAnswer,
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
  }

  return {
    type,
    playerId,
    answer,
    created: new Date(),
  }
}

/**
 * Deserializes a string to create a `QuestionTaskAnswer` object.
 *
 * @param serializedValue - The serialized string representation of a question task answer.
 *
 * @returns {QuestionTaskAnswer} The deserialized `QuestionTaskAnswer` object.
 */
export function toQuestionTaskAnswerFromString(
  serializedValue: string,
): QuestionTaskAnswer {
  const deserializedValue = JSON.parse(serializedValue)

  const base: QuestionTaskBaseAnswer = {
    type: deserializedValue.type as QuestionType,
    playerId: deserializedValue.playerId as string,
    created: new Date(deserializedValue.created as Date),
  }

  let answer: string | string[] | number | boolean

  switch (deserializedValue.type) {
    case QuestionType.MultiChoice:
      answer = deserializedValue.answer as number
      break
    case QuestionType.Range:
      answer = deserializedValue.answer as number
      break
    case QuestionType.TrueFalse:
      answer = deserializedValue.answer as boolean
      break
    case QuestionType.TypeAnswer:
      answer = deserializedValue.answer as string
      break
    case QuestionType.Pin:
      answer = deserializedValue.answer as string
      break
    case QuestionType.Puzzle:
      answer = deserializedValue.answer as string[]
      break
  }

  return { ...base, answer }
}

/**
 * Converts serialized answers and participant information into metadata and answers.
 *
 * @param serializedAnswers - An array of serialized answers retrieved from Redis.
 * @param metaData - Partial metadata containing current and total submissions.
 * @param participants - The list of game participants, used to calculate submission-related metadata.
 *
 * @returns A tuple containing deserialized answers and metadata.
 */
export function toBaseQuestionTaskEventMetaDataTuple(
  serializedAnswers: string[],
  metaData: Partial<GameEventMetaData>,
  participants: Participant[],
): [QuestionTaskAnswer[], Partial<GameEventMetaData>] {
  const answers = serializedAnswers.map((serializedValue) => {
    const deserializedValue = JSON.parse(serializedValue)

    const base: QuestionTaskBaseAnswer = {
      type: deserializedValue.type as QuestionType,
      playerId: deserializedValue.playerId as string,
      created: new Date(deserializedValue.created as Date),
    }

    let answer: string | string[] | number | boolean

    switch (deserializedValue.type) {
      case QuestionType.MultiChoice:
        answer = deserializedValue.answer as number
        break
      case QuestionType.Range:
        answer = deserializedValue.answer as number
        break
      case QuestionType.TrueFalse:
        answer = deserializedValue.answer as boolean
        break
      case QuestionType.TypeAnswer:
        answer = deserializedValue.answer as string
        break
      case QuestionType.Pin:
        answer = deserializedValue.answer as string
        break
      case QuestionType.Puzzle:
        answer = deserializedValue.answer as string[]
        break
    }

    return { ...base, answer }
  })

  return [
    answers,
    {
      ...metaData,
      currentAnswerSubmissions: serializedAnswers.length,
      totalAnswerSubmissions: participants.filter(
        (participant) => participant.type === GameParticipantType.PLAYER,
      ).length,
    },
  ]
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
