import {
  GameMode,
  QuestionPinTolerance,
  QuestionRangeAnswerMargin,
  QuestionType,
} from '@quiz/common'

import {
  QuestionResultTaskBaseCorrectAnswer,
  QuestionResultTaskCorrectMultiChoiceAnswer,
  QuestionResultTaskCorrectPinAnswer,
  QuestionResultTaskCorrectPuzzleAnswer,
  QuestionResultTaskCorrectRangeAnswer,
  QuestionResultTaskCorrectTrueFalseAnswer,
  QuestionResultTaskCorrectTypeAnswer,
  QuestionTaskBaseAnswer,
  QuestionTaskMultiChoiceAnswer,
  QuestionTaskPinAnswer,
  QuestionTaskPuzzleAnswer,
  QuestionTaskRangeAnswer,
  QuestionTaskTrueFalseAnswer,
  QuestionTaskTypeAnswerAnswer,
} from '../../../../../repositories/models/schemas'

/**
 * Helper type that combines the common correct/answer fields with
 * question-type specific extensions.
 *
 * This ensures that all scoring logic always has access to:
 * - shared metadata from `QuestionResultTaskBaseCorrectAnswer` / `QuestionTaskBaseAnswer`
 * - plus the concrete fields needed for the specific question type.
 */
export type WithBase<CorrectExtension, AnswerExtension> = {
  correct: QuestionResultTaskBaseCorrectAnswer & CorrectExtension
  answer: QuestionTaskBaseAnswer & AnswerExtension
}

/**
 * Central mapping between game modes, question types and their
 * corresponding correct/answer payload shapes used by scoring.
 *
 * Each entry defines the concrete types that a scoring strategy
 * will receive for a given (GameMode, QuestionType) combination.
 */
export type MappedScoringType = {
  [GameMode.Classic]: {
    [QuestionType.MultiChoice]: WithBase<
      QuestionResultTaskCorrectMultiChoiceAnswer,
      QuestionTaskMultiChoiceAnswer
    >
    [QuestionType.Range]: WithBase<
      QuestionResultTaskCorrectRangeAnswer,
      QuestionTaskRangeAnswer
    >
    [QuestionType.TrueFalse]: WithBase<
      QuestionResultTaskCorrectTrueFalseAnswer,
      QuestionTaskTrueFalseAnswer
    >
    [QuestionType.TypeAnswer]: WithBase<
      QuestionResultTaskCorrectTypeAnswer,
      QuestionTaskTypeAnswerAnswer
    >
    [QuestionType.Pin]: WithBase<
      QuestionResultTaskCorrectPinAnswer,
      QuestionTaskPinAnswer
    >
    [QuestionType.Puzzle]: WithBase<
      QuestionResultTaskCorrectPuzzleAnswer,
      QuestionTaskPuzzleAnswer
    >
  }
  [GameMode.ZeroToOneHundred]: {
    [QuestionType.Range]: WithBase<
      QuestionResultTaskCorrectRangeAnswer,
      QuestionTaskRangeAnswer
    >
  }
}

/**
 * Optional extra metadata passed to scoring for each (game mode, question type)
 * combination. This can include things like:
 * - streaks
 * - per-question configuration
 * - aggregate game stats
 * - difficulty modifiers, etc.
 */
export type MappedScoringMeta = {
  [GameMode.Classic]: {
    [QuestionType.MultiChoice]: object
    [QuestionType.Range]: {
      margin: QuestionRangeAnswerMargin
      min: number
      max: number
      step: number
    }
    [QuestionType.TrueFalse]: object
    [QuestionType.TypeAnswer]: object
    [QuestionType.Pin]: {
      tolerance: QuestionPinTolerance
    }
    [QuestionType.Puzzle]: object
  }
  [GameMode.ZeroToOneHundred]: {
    [QuestionType.Range]: object
  }
}

/**
 * Union of game modes that have scoring metadata defined in
 * `MappedScoringType`.
 */
export type SupportedGameMode = keyof MappedScoringType

/**
 * Extracts the set of supported question types for a given game mode.
 *
 * For example:
 * - `QuestionTypeForMode<GameMode.Classic>` will be the Classic question types.
 */
export type QuestionTypeForMode<T extends SupportedGameMode> =
  keyof MappedScoringType[T]

/**
 * Resolves the concrete "correct answer" payload type for a given
 * (game mode, question type) pair.
 *
 * This is used by scoring strategies to get strongly-typed access
 * to the stored correct answer data.
 */
export type CorrectFor<
  T extends SupportedGameMode,
  K extends QuestionTypeForMode<T>,
> =
  MappedScoringType[T][K] extends WithBase<infer C, unknown>
    ? QuestionResultTaskBaseCorrectAnswer & C
    : never

/**
 * Resolves the concrete "player answer" payload type for a given
 * (game mode, question type) pair.
 *
 * This is used by scoring strategies to get strongly-typed access
 * to the answer submitted by the player.
 */
export type AnswerFor<
  T extends SupportedGameMode,
  K extends QuestionTypeForMode<T>,
> =
  MappedScoringType[T][K] extends WithBase<unknown, infer A>
    ? QuestionTaskBaseAnswer & A
    : never

/**
 * Metadata/context type available to scoring for a given
 * (game mode, question type) pair.
 */
export type MetaFor<
  T extends SupportedGameMode,
  K extends QuestionTypeForMode<T>,
> = K extends keyof MappedScoringMeta[T] ? MappedScoringMeta[T][K] : never
