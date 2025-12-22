import {
  GameMode,
  QuestionDto,
  QuestionMultiChoiceDto,
  QuestionPinDto,
  QuestionPuzzleDto,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionType,
  QuestionTypeAnswerDto,
  QuestionZeroToOneHundredRangeDto,
} from '@quiz/common'

/**
 * Type guard for a Classic-mode MultiChoice question.
 *
 * Returns true when the current game mode is Classic and the question
 * discriminator indicates a MultiChoice question.
 *
 * Safely handles undefined or partial question data.
 *
 * @param mode - The active game mode.
 * @param question - The question data to evaluate.
 * @returns True if the question is a Classic MultiChoice question.
 */
export function isClassicMultiChoiceQuestion(
  mode: GameMode,
  question?: Partial<QuestionDto>,
): question is QuestionMultiChoiceDto {
  return (
    mode === GameMode.Classic && question?.type === QuestionType.MultiChoice
  )
}

/**
 * Type guard for a Classic-mode True/False question.
 *
 * Returns true when the current game mode is Classic and the question
 * discriminator indicates a True/False question.
 *
 * Safely handles undefined or partial question data.
 *
 * @param mode - The active game mode.
 * @param question - The question data to evaluate.
 * @returns True if the question is a Classic True/False question.
 */
export function isClassicTrueFalseQuestion(
  mode: GameMode,
  question?: Partial<QuestionDto>,
): question is QuestionTrueFalseDto {
  return mode === GameMode.Classic && question?.type === QuestionType.TrueFalse
}

/**
 * Type guard for a Classic-mode Range question.
 *
 * Returns true when the current game mode is Classic and the question
 * discriminator indicates a Range question.
 *
 * Safely handles undefined or partial question data.
 *
 * @param mode - The active game mode.
 * @param question - The question data to evaluate.
 * @returns True if the question is a Classic Range question.
 */
export function isClassicRangeQuestion(
  mode: GameMode,
  question?: Partial<QuestionDto>,
): question is QuestionRangeDto {
  return mode === GameMode.Classic && question?.type === QuestionType.Range
}

/**
 * Type guard for a Classic-mode Type Answer question.
 *
 * Returns true when the current game mode is Classic and the question
 * discriminator indicates a Type Answer question.
 *
 * Safely handles undefined or partial question data.
 *
 * @param mode - The active game mode.
 * @param question - The question data to evaluate.
 * @returns True if the question is a Classic Type Answer question.
 */
export function isClassicTypeAnswerQuestion(
  mode: GameMode,
  question?: Partial<QuestionDto>,
): question is QuestionTypeAnswerDto {
  return mode === GameMode.Classic && question?.type === QuestionType.TypeAnswer
}

/**
 * Type guard for a Classic-mode Pin question.
 *
 * Returns true when the current game mode is Classic and the question
 * discriminator indicates a Pin question.
 *
 * Safely handles undefined or partial question data.
 *
 * @param mode - The active game mode.
 * @param question - The question data to evaluate.
 * @returns True if the question is a Classic Pin question.
 */
export function isClassicPinQuestion(
  mode: GameMode,
  question?: Partial<QuestionDto>,
): question is QuestionPinDto {
  return mode === GameMode.Classic && question?.type === QuestionType.Pin
}

/**
 * Type guard for a Classic-mode Puzzle question.
 *
 * Returns true when the current game mode is Classic and the question
 * discriminator indicates a Puzzle question.
 *
 * Safely handles undefined or partial question data.
 *
 * @param mode - The active game mode.
 * @param question - The question data to evaluate.
 * @returns True if the question is a Classic Puzzle question.
 */
export function isClassicPuzzleQuestion(
  mode: GameMode,
  question?: Partial<QuestionDto>,
): question is QuestionPuzzleDto {
  return mode === GameMode.Classic && question?.type === QuestionType.Puzzle
}

/**
 * Type guard for a Zero-to-One-Hundred-mode Range question.
 *
 * Returns true when the current game mode is Zero-to-One-Hundred and the
 * question discriminator indicates a Range question.
 *
 * @param mode - The active game mode.
 * @param question - The question data to evaluate.
 * @returns True if the question is a Zero-to-One-Hundred Range question.
 */
export function isZeroToOneHundredRangeQuestion(
  mode: GameMode,
  question?: Partial<QuestionDto>,
): question is QuestionZeroToOneHundredRangeDto {
  return (
    mode === GameMode.ZeroToOneHundred && question?.type === QuestionType.Range
  )
}
