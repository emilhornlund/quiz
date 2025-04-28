import {
  GameParticipantType,
  QuestionType,
  SubmitQuestionAnswerRequestDto,
} from '@quiz/common'

import {
  Participant,
  ParticipantBase,
  ParticipantPlayer,
  QuestionResultTaskBaseCorrectAnswer,
  QuestionResultTaskCorrectAnswer,
  QuestionResultTaskCorrectMultiChoiceAnswer,
  QuestionResultTaskCorrectRangeAnswer,
  QuestionResultTaskCorrectTrueFalseAnswer,
  QuestionResultTaskCorrectTypeAnswer,
  QuestionTaskAnswer,
  QuestionTaskBaseAnswer,
  QuestionTaskMultiChoiceAnswer,
  QuestionTaskRangeAnswer,
  QuestionTaskTrueFalseAnswer,
  QuestionTaskTypeAnswerAnswer,
} from '../models/schemas'

import { GameEventMetaData } from './game-event.converter'

type Answer = QuestionTaskBaseAnswer &
  (
    | QuestionTaskMultiChoiceAnswer
    | QuestionTaskRangeAnswer
    | QuestionTaskTrueFalseAnswer
    | QuestionTaskTypeAnswerAnswer
  )

/**
 * Checks if the given answer is of type `MultiChoice`.
 *
 * @param {Answer} answer - The answer object to check.
 *
 * @returns {boolean} Returns `true` if the answer is of type `MultiChoice`, otherwise `false`.
 */
export function isMultiChoiceAnswer(
  answer?: Answer,
): answer is QuestionTaskBaseAnswer &
  QuestionTaskMultiChoiceAnswer & {
    type: QuestionType.MultiChoice
  } {
  return answer?.type === QuestionType.MultiChoice
}

/**
 * Checks if the given answer is of type `Range`.
 *
 * @param {Answer} answer - The answer object to check.
 *
 * @returns {boolean} Returns `true` if the answer is of type `Range`, otherwise `false`.
 */
export function isRangeAnswer(
  answer?: Answer,
): answer is QuestionTaskBaseAnswer &
  QuestionTaskRangeAnswer & {
    type: QuestionType.Range
  } {
  return answer?.type === QuestionType.Range
}

/**
 * Checks if the given answer is of type `TrueFalse`.
 *
 * @param {Answer} answer - The answer object to check.
 *
 * @returns {boolean} Returns `true` if the answer is of type `TrueFalse`, otherwise `false`.
 */
export function isTrueFalseAnswer(
  answer?: Answer,
): answer is QuestionTaskBaseAnswer &
  QuestionTaskTrueFalseAnswer & {
    type: QuestionType.TrueFalse
  } {
  return answer?.type === QuestionType.TrueFalse
}

/**
 * Checks if the given answer is of type `TypeAnswer`.
 *
 * @param {Answer} answer - The answer object to check.
 *
 * @returns {boolean} Returns `true` if the answer is of type `TypeAnswer`, otherwise `false`.
 */
export function isTypeAnswerAnswer(
  answer?: Answer,
): answer is QuestionTaskBaseAnswer &
  QuestionTaskTypeAnswerAnswer & {
    type: QuestionType.TypeAnswer
  } {
  return answer?.type === QuestionType.TypeAnswer
}

/**
 * Converts a player's submitted answer into a question task answer format.
 *
 * This function takes the player ID and the submitted answer data, and returns a
 * properly formatted answer object based on the question type. It supports multiple
 * question types, including multi-choice, range, true/false, and type answer.
 *
 * @param {string} playerId - The unique identifier of the player submitting the answer.
 * @param {SubmitQuestionAnswerRequestDto} submitQuestionAnswerRequest - The answer data
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

  let answer: string | number | boolean

  if (type === QuestionType.MultiChoice) {
    answer = submitQuestionAnswerRequest.optionIndex
  } else if (
    type === QuestionType.Range ||
    type === QuestionType.TrueFalse ||
    type === QuestionType.TypeAnswer
  ) {
    answer = submitQuestionAnswerRequest.value
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
 * @param {string} serializedValue - The serialized string representation of a question task answer.
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

  let answer: string | number | boolean

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
 * @returns {[QuestionTaskAnswer[], Partial<GameEventMetaData>]} A tuple containing deserialized answers and metadata.
 */
export function toBaseQuestionTaskEventMetaDataTuple(
  serializedAnswers: string[],
  metaData: Partial<GameEventMetaData>,
  participants: Participant[],
): [QuestionTaskAnswer[], Partial<GameEventMetaData>] {
  return [
    serializedAnswers.map(toQuestionTaskAnswerFromString),
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
 * Constructs metadata for a player's question event based on their answers.
 *
 * @param answers - The list of answers submitted for the current question task.
 * @param participant - The participant for whom the metadata is generated.
 *
 * @returns {Partial<GameEventMetaData>} Metadata indicating whether the participant has submitted an answer.
 */
export function toPlayerQuestionPlayerEventMetaData(
  answers: QuestionTaskAnswer[],
  participant: ParticipantBase & ParticipantPlayer,
): Partial<GameEventMetaData> {
  return {
    hasPlayerAnswerSubmission: !!answers?.find(
      (answer) => answer.playerId === participant.player._id,
    ),
  }
}

/**
 * Checks if the given correct answer is of type `MultiChoice`.
 *
 * @param answer - The answer object to check.
 *
 * @returns Returns `true` if the correct answer is of type `MultiChoice`, otherwise `false`.
 */
export function isMultiChoiceCorrectAnswer(
  answer?: QuestionResultTaskCorrectAnswer,
): answer is QuestionResultTaskBaseCorrectAnswer &
  QuestionResultTaskCorrectMultiChoiceAnswer & {
    type: QuestionType.MultiChoice
  } {
  return answer?.type === QuestionType.MultiChoice
}

/**
 * Checks if the given correct answer is of type `Range`.
 *
 * @param answer - The answer object to check.
 *
 * @returns Returns `true` if the correct answer is of type `Range`, otherwise `false`.
 */
export function isRangeCorrectAnswer(
  answer?: QuestionResultTaskCorrectAnswer,
): answer is QuestionResultTaskBaseCorrectAnswer &
  QuestionResultTaskCorrectRangeAnswer & {
    type: QuestionType.Range
  } {
  return answer?.type === QuestionType.Range
}

/**
 * Checks if the given correct answer is of type `TrueFalse`.
 *
 * @param answer - The answer object to check.
 *
 * @returns Returns `true` if the correct answer is of type `TrueFalse`, otherwise `false`.
 */
export function isTrueFalseCorrectAnswer(
  answer?: QuestionResultTaskCorrectAnswer,
): answer is QuestionResultTaskBaseCorrectAnswer &
  QuestionResultTaskCorrectTrueFalseAnswer & {
    type: QuestionType.TrueFalse
  } {
  return answer?.type === QuestionType.TrueFalse
}

/**
 * Checks if the given correct answer is of type `TypeAnswer`.
 *
 * @param answer - The answer object to check.
 *
 * @returns Returns `true` if the correct answer is of type `TypeAnswer`, otherwise `false`.
 */
export function isTypeAnswerCorrectAnswer(
  answer?: QuestionResultTaskCorrectAnswer,
): answer is QuestionResultTaskBaseCorrectAnswer &
  QuestionResultTaskCorrectTypeAnswer & {
    type: QuestionType.TypeAnswer
  } {
  return answer?.type === QuestionType.TypeAnswer
}
