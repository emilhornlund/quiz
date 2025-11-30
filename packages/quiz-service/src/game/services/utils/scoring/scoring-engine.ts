import { GameMode, QuestionType } from '@quiz/common'

import { QuestionDao } from '../../../../quiz/repositories/models/schemas'
import {
  isClassicMultiChoiceQuestion,
  isClassicPinQuestion,
  isClassicPuzzleQuestion,
  isClassicRangeQuestion,
  isClassicTrueFalseQuestion,
  isClassicTypeAnswerQuestion,
  isZeroToOneHundredRangeQuestion,
} from '../../../../quiz/services/utils'
import { UnsupportedGameModeException } from '../../../exceptions'
import {
  QuestionResultTaskCorrectAnswer,
  QuestionTaskAnswer,
} from '../../../repositories/models/schemas'
import {
  isMultiChoiceAnswer,
  isMultiChoiceCorrectAnswer,
  isPinAnswer,
  isPinCorrectAnswer,
  isPuzzleAnswer,
  isPuzzleCorrectAnswer,
  isRangeAnswer,
  isRangeCorrectAnswer,
  isTrueFalseAnswer,
  isTrueFalseCorrectAnswer,
  isTypeAnswerAnswer,
  isTypeAnswerCorrectAnswer,
} from '../question-answer.utils'

import { ClassicMultiChoiceScoringStrategy } from './classic/classic-multichoice-strategy'
import { ClassicPinScoringStrategy } from './classic/classic-pin-strategy'
import { ClassicPuzzleScoringStrategy } from './classic/classic-puzzle-strategy'
import { ClassicRangeScoringStrategy } from './classic/classic-range-strategy'
import { ClassicTrueFalseScoringStrategy } from './classic/classic-true-false-strategy'
import { ClassicTypeAnswerScoringStrategy } from './classic/classic-type-answer-strategy'
import {
  AnswerFor,
  CorrectFor,
  MetaFor,
  QuestionTypeForMode,
  SupportedGameMode,
} from './core/scoring-mapped-types'
import { ScoringStrategy } from './core/scoring-strategy.interface'
import { ZeroToOneHundredRangeScoringStrategy } from './zero-to-one-hundred/zero-to-one-hundred-range-strategy'

/**
 * Internal mapping from Classic question types to their scoring strategies.
 *
 * Each entry provides the `ScoringStrategy` implementation to use for a
 * specific Classic question type.
 */
type ClassicStrategyMap = {
  [K in QuestionTypeForMode<GameMode.Classic>]: ScoringStrategy<
    GameMode.Classic,
    K
  >
}

/**
 * Internal mapping from ZeroToOneHundred question types to their
 * scoring strategies.
 *
 * Each entry provides the `ScoringStrategy` implementation to use for a
 * specific ZeroToOneHundred question type.
 */
type ZeroToOneHundredStrategyMap = {
  [K in QuestionTypeForMode<GameMode.ZeroToOneHundred>]: ScoringStrategy<
    GameMode.ZeroToOneHundred,
    K
  >
}

/**
 * Registry of scoring strategies for Classic mode, keyed by question type.
 * Strategies are instantiated once per process and reused.
 */
const classicStrategies: Partial<ClassicStrategyMap> = {
  [QuestionType.MultiChoice]: new ClassicMultiChoiceScoringStrategy(),
  [QuestionType.Range]: new ClassicRangeScoringStrategy(),
  [QuestionType.TrueFalse]: new ClassicTrueFalseScoringStrategy(),
  [QuestionType.TypeAnswer]: new ClassicTypeAnswerScoringStrategy(),
  [QuestionType.Pin]: new ClassicPinScoringStrategy(),
  [QuestionType.Puzzle]: new ClassicPuzzleScoringStrategy(),
}

/**
 * Registry of scoring strategies for ZeroToOneHundred mode, keyed by question type.
 * Strategies are instantiated once per process and reused.
 */
const zeroToOneHundredStrategies: Partial<ZeroToOneHundredStrategyMap> = {
  [QuestionType.Range]: new ZeroToOneHundredRangeScoringStrategy(),
}

/**
 * Resolves the scoring strategy for a given game mode and question type.
 *
 * @typeParam T - Game mode (e.g. Classic, ZeroToOneHundred).
 * @typeParam K - Question type valid for the given game mode.
 *
 * @param mode - Game mode to resolve the strategy for.
 * @param type - Question type to resolve the strategy for.
 *
 * @returns The scoring strategy for the given (mode, type) combination.
 *
 * @throws Error if no strategy is registered for the given combination
 *         or if the game mode is not supported.
 */
function getStrategy<
  T extends SupportedGameMode,
  K extends QuestionTypeForMode<T>,
>(mode: T, type: K): ScoringStrategy<T, K> {
  if (mode === GameMode.Classic) {
    const strategy =
      classicStrategies[type as QuestionTypeForMode<GameMode.Classic>]
    if (!strategy) {
      throw new Error(
        `No Classic scoring strategy for question type ${String(type)}`,
      )
    }
    return strategy as unknown as ScoringStrategy<T, K>
  }

  if (mode === GameMode.ZeroToOneHundred) {
    const strategy =
      zeroToOneHundredStrategies[
        type as QuestionTypeForMode<GameMode.ZeroToOneHundred>
      ]
    if (!strategy) {
      throw new Error(
        `No ZeroToOneHundred scoring strategy for question type ${String(
          type,
        )}`,
      )
    }
    return strategy as unknown as ScoringStrategy<T, K>
  }

  throw new UnsupportedGameModeException(mode)
}

/**
 * Builds the typed `correct` payload required by the scoring strategy
 * from the raw question and stored correct answers.
 *
 * The returned type is aligned with the `(mode, type)` combination via
 * the `CorrectFor<T, K>` mapping.
 *
 * @typeParam T - Game mode (e.g. Classic, ZeroToOneHundred).
 * @typeParam K - Question type valid for the given game mode.
 *
 * @param mode - Game mode used for the question.
 * @param type - Question type used for the question.
 * @param question - Question definition as stored in the database.
 * @param correctAnswer - Raw correct-answer for the question.
 *
 * @returns A strongly-typed `correct` payload for the strategy.
 */
function buildCorrect<
  T extends SupportedGameMode,
  K extends QuestionTypeForMode<T>,
>(
  mode: T,
  type: K,
  question: QuestionDao,
  correctAnswer: QuestionResultTaskCorrectAnswer,
): CorrectFor<T, K> {
  if (
    isClassicMultiChoiceQuestion(mode, question) &&
    isMultiChoiceCorrectAnswer(correctAnswer)
  ) {
    return correctAnswer as unknown as CorrectFor<T, K>
  }

  if (
    isClassicRangeQuestion(mode, question) &&
    isRangeCorrectAnswer(correctAnswer)
  ) {
    return correctAnswer as unknown as CorrectFor<T, K>
  }

  if (
    isClassicTrueFalseQuestion(mode, question) &&
    isTrueFalseCorrectAnswer(correctAnswer)
  ) {
    return correctAnswer as unknown as CorrectFor<T, K>
  }

  if (
    isClassicTypeAnswerQuestion(mode, question) &&
    isTypeAnswerCorrectAnswer(correctAnswer)
  ) {
    return correctAnswer as unknown as CorrectFor<T, K>
  }

  if (
    isClassicPinQuestion(mode, question) &&
    isPinCorrectAnswer(correctAnswer)
  ) {
    return correctAnswer as unknown as CorrectFor<T, K>
  }

  if (
    isClassicPuzzleQuestion(mode, question) &&
    isPuzzleCorrectAnswer(correctAnswer)
  ) {
    return correctAnswer as unknown as CorrectFor<T, K>
  }

  if (
    isZeroToOneHundredRangeQuestion(mode, question) &&
    isRangeCorrectAnswer(correctAnswer)
  ) {
    return correctAnswer as unknown as CorrectFor<T, K>
  }

  throw new Error(
    `No scoring correct for game mode ${String(mode)} and question type ${String(type)}`,
  )
}

/**
 * Builds the typed `answer` payload required by the scoring strategy
 * from the raw stored answer.
 *
 * The returned type is aligned with the `(mode, type)` combination via
 * the `AnswerFor<T, K>` mapping.
 *
 * @typeParam T - Game mode (e.g. Classic, ZeroToOneHundred).
 * @typeParam K - Question type valid for the given game mode.
 *
 * @param mode - Game mode used for the question.
 * @param type - Question type used for the question.
 * @param question - Question definition as stored in the database.
 * @param rawAnswer - Raw persisted answer payload for the participant.
 *
 * @returns A strongly-typed `answer` payload for the strategy, or `undefined`
 *          if an answer is missing or cannot be mapped.
 */
function buildAnswer<
  T extends SupportedGameMode,
  K extends QuestionTypeForMode<T>,
>(
  mode: T,
  type: K,
  question: QuestionDao,
  rawAnswer: QuestionTaskAnswer,
): AnswerFor<T, K> | undefined {
  if (
    isClassicMultiChoiceQuestion(mode, question) &&
    isMultiChoiceAnswer(rawAnswer)
  ) {
    return rawAnswer as unknown as AnswerFor<T, K>
  }

  if (isClassicRangeQuestion(mode, question) && isRangeAnswer(rawAnswer)) {
    return rawAnswer as unknown as AnswerFor<T, K>
  }

  if (
    isClassicTrueFalseQuestion(mode, question) &&
    isTrueFalseAnswer(rawAnswer)
  ) {
    return rawAnswer as unknown as AnswerFor<T, K>
  }

  if (
    isClassicTypeAnswerQuestion(mode, question) &&
    isTypeAnswerAnswer(rawAnswer)
  ) {
    return rawAnswer as unknown as AnswerFor<T, K>
  }

  if (isClassicPinQuestion(mode, question) && isPinAnswer(rawAnswer)) {
    return rawAnswer as unknown as AnswerFor<T, K>
  }

  if (isClassicPuzzleQuestion(mode, question) && isPuzzleAnswer(rawAnswer)) {
    return rawAnswer as unknown as AnswerFor<T, K>
  }

  if (
    isZeroToOneHundredRangeQuestion(mode, question) &&
    isRangeAnswer(rawAnswer)
  ) {
    return rawAnswer as unknown as AnswerFor<T, K>
  }

  return undefined as AnswerFor<T, K> | undefined
}

/**
 * Builds the scoring metadata/context object for a given question.
 *
 * The returned type is aligned with the `(mode, type)` combination via
 * the `MetaFor<T, K>` mapping and typically contains configuration such as:
 * - tolerance or margins
 * - min/max/step for ranges
 * - mode-specific scoring parameters
 *
 * @typeParam T - Game mode (e.g. Classic, ZeroToOneHundred).
 * @typeParam K - Question type valid for the given game mode.
 *
 * @param mode - Game mode used for the question.
 * @param type - Question type used for the question.
 * @param question - Question definition as stored in the database.
 *
 * @returns A strongly-typed metadata/context object for the strategy.
 */
function buildMeta<
  T extends SupportedGameMode,
  K extends QuestionTypeForMode<T>,
>(mode: T, type: K, question: QuestionDao): MetaFor<T, K> {
  if (isClassicMultiChoiceQuestion(mode, question)) {
    return {} as unknown as MetaFor<T, K>
  }

  if (isClassicRangeQuestion(mode, question)) {
    const { margin, min, max, step } = question
    return { margin, min, max, step } as unknown as MetaFor<T, K>
  }

  if (isClassicTrueFalseQuestion(mode, question)) {
    return {} as unknown as MetaFor<T, K>
  }

  if (isClassicTypeAnswerQuestion(mode, question)) {
    return {} as unknown as MetaFor<T, K>
  }

  if (isClassicPinQuestion(mode, question)) {
    const tolerance = question.tolerance
    return { tolerance } as unknown as MetaFor<T, K>
  }

  if (isClassicPuzzleQuestion(mode, question)) {
    return {} as unknown as MetaFor<T, K>
  }

  if (isZeroToOneHundredRangeQuestion(mode, question)) {
    return {} as unknown as MetaFor<T, K>
  }

  throw new Error(
    `No scoring meta for game mode ${String(mode)} and question type ${String(type)}`,
  )
}

/**
 * Calculates the score for a single participant's answer to a single question.
 *
 * Responsibilities:
 * - Resolve the correct scoring strategy based on game mode and question type.
 * - Build the strongly-typed `correct`, `answer` and `meta` payloads.
 * - Delegate to the strategy's `calculateScore` implementation.
 *
 * Note: this function only returns the numeric score. If you also need
 * `isCorrect` or additional metadata, wrap this call in a higher-level
 * service that combines those results.
 *
 * @param mode - Game mode used for the question (e.g. Classic, ZeroToOneHundred).
 * @param presented - Timestamp when the question was presented to the participant.
 * @param question - Question definition used to derive duration, points and meta.
 * @param correctAnswers - Canonical correct answers persisted for this question.
 * @param answer - Raw persisted answer payload for the participant.
 * @returns The calculated score for this participant and question.
 */
export function calculateQuestionScoreForParticipant(
  mode: GameMode,
  presented: Date,
  question: QuestionDao,
  correctAnswers: QuestionResultTaskCorrectAnswer[],
  answer?: QuestionTaskAnswer,
): number {
  if (!answer) {
    if (mode === GameMode.Classic) {
      return 0
    }
    if (mode === GameMode.ZeroToOneHundred) {
      return 100
    }
    throw new UnsupportedGameModeException(mode)
  }

  const type = question.type as QuestionTypeForMode<typeof mode>

  const strategy = getStrategy(mode as SupportedGameMode, type)

  const answered = answer.created ?? new Date()
  const duration = question.duration
  const points = question.points

  const typedAnswer = buildAnswer(
    mode as SupportedGameMode,
    type,
    question,
    answer,
  )

  const meta = buildMeta(mode as SupportedGameMode, type, question)

  const scores = correctAnswers.map((correctAnswer) => {
    const correct = buildCorrect(
      mode as SupportedGameMode,
      type,
      question,
      correctAnswer,
    )

    return strategy.calculateScore(
      presented,
      answered,
      duration,
      points,
      correct,
      typedAnswer,
      meta,
    )
  })

  return (
    scores.sort((lhs, rhs) => {
      if (mode === GameMode.Classic) {
        return rhs - lhs // max
      }
      if (mode === GameMode.ZeroToOneHundred) {
        return lhs - rhs // min
      }
      throw new UnsupportedGameModeException(mode)
    })[0] ?? 0
  )
}

/**
 * Determines whether a stored participant answer is correct for a given question.
 *
 * Behaviour:
 * - Resolves the appropriate scoring strategy from the game mode and question type.
 * - Builds strongly-typed `correct`, `answer` and `meta` payloads.
 * - Returns `true` if at least one of the configured correct answers is considered
 *   correct by the strategy, otherwise `false`.
 * - If no answer is provided or it cannot be mapped to the expected type, returns `false`.
 *
 * @param mode           Game mode used for the question (for example Classic or ZeroToOneHundred).
 * @param question       Question definition as stored in the database.
 * @param correctAnswers Canonical correct answers persisted for this question.
 * @param answer         Raw persisted answer payload for the participant, or `undefined`.
 * @returns `true` if the answer is considered correct for at least one correct alternative, otherwise `false`.
 */
export function isQuestionAnswerCorrect(
  mode: GameMode,
  question: QuestionDao,
  correctAnswers: QuestionResultTaskCorrectAnswer[],
  answer?: QuestionTaskAnswer,
): boolean {
  if (!answer) {
    return false
  }

  const type = question.type as QuestionTypeForMode<typeof mode>
  const strategy = getStrategy(mode as SupportedGameMode, type)

  const typedAnswer = buildAnswer(
    mode as SupportedGameMode,
    type,
    question,
    answer,
  )

  if (!typedAnswer) {
    return false
  }

  const meta = buildMeta(mode as SupportedGameMode, type, question)

  return correctAnswers.some((correctAnswer) => {
    const correct = buildCorrect(
      mode as SupportedGameMode,
      type,
      question,
      correctAnswer,
    )

    return strategy.isCorrect(correct, typedAnswer, meta)
  })
}
