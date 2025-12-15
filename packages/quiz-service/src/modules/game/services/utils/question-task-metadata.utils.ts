import { QuestionType } from '@quiz/common'

import {
  QuestionTaskBaseMetadata,
  QuestionTaskMetadata,
  QuestionTaskMultiChoiceMetadata,
  QuestionTaskPinMetadata,
  QuestionTaskPuzzleMetadata,
  QuestionTaskRangeMetadata,
  QuestionTaskTrueFalseMetadata,
  QuestionTaskTypeAnswerMetadata,
} from '../../repositories/models/schemas'

/**
 * Checks if the given metadata is of type `MultiChoice`.
 *
 * @param metadata - The metadata data object of the current question task.
 *
 * @returns Returns `true` if the metadata is of type `MultiChoice`, otherwise `false`.
 */
export function isMultiChoiceMetadata(
  metadata?: QuestionTaskMetadata,
): metadata is QuestionTaskBaseMetadata & QuestionTaskMultiChoiceMetadata {
  return metadata?.type === QuestionType.MultiChoice
}

/**
 * Checks if the given metadata is of type `Range`.
 *
 * @param metadata - The metadata data object of the current question task.
 *
 * @returns Returns `true` if the metadata is of type `Range`, otherwise `false`.
 */
export function isRangeMetadata(
  metadata?: QuestionTaskMetadata,
): metadata is QuestionTaskBaseMetadata & QuestionTaskRangeMetadata {
  return metadata?.type === QuestionType.Range
}

/**
 * Checks if the given metadata is of type `TrueFalse`.
 *
 * @param metadata - The metadata data object of the current question task.
 *
 * @returns Returns `true` if the metadata is of type `TrueFalse`, otherwise `false`.
 */
export function isTrueFalseMetadata(
  metadata?: QuestionTaskMetadata,
): metadata is QuestionTaskBaseMetadata & QuestionTaskTrueFalseMetadata {
  return metadata?.type === QuestionType.TrueFalse
}

/**
 * Checks if the given metadata is of type `TypeAnswer`.
 *
 * @param metadata - The metadata data object of the current question task.
 *
 * @returns Returns `true` if the metadata is of type `TypeAnswer`, otherwise `false`.
 */
export function isTypeAnswerMetadata(
  metadata?: QuestionTaskMetadata,
): metadata is QuestionTaskBaseMetadata & QuestionTaskTypeAnswerMetadata {
  return metadata?.type === QuestionType.TypeAnswer
}

/**
 * Checks if the given metadata is of type `Pin`.
 *
 * @param metadata - The metadata data object of the current question task.
 *
 * @returns Returns `true` if the metadata is of type `Pin`, otherwise `false`.
 */
export function isPinMetadata(
  metadata?: QuestionTaskMetadata,
): metadata is QuestionTaskBaseMetadata & QuestionTaskPinMetadata {
  return metadata?.type === QuestionType.Pin
}

/**
 * Checks if the given metadata is of type `Puzzle`.
 *
 * @param metadata - The metadata data object of the current question task.
 *
 * @returns Returns `true` if the metadata is of type `Puzzle`, otherwise `false`.
 */
export function isPuzzleMetadata(
  metadata?: QuestionTaskMetadata,
): metadata is QuestionTaskBaseMetadata & QuestionTaskPuzzleMetadata {
  return metadata?.type === QuestionType.Puzzle
}
