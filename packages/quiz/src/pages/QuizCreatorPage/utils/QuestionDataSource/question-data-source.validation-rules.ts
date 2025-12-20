import {
  QuestionMultiChoiceDto,
  QuestionPinDto,
  QuestionPuzzleDto,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionType,
  QuestionTypeAnswerDto,
  QuestionZeroToOneHundredRangeDto,
  QUIZ_QUESTION_INFO_MAX_LENGTH,
  QUIZ_QUESTION_INFO_MIN_LENGTH,
  QUIZ_QUESTION_INFO_REGEX,
  QUIZ_QUESTION_TEXT_MAX_LENGTH,
  QUIZ_QUESTION_TEXT_MIN_LENGTH,
  QUIZ_QUESTION_TEXT_REGEX,
  URL_REGEX,
} from '@quiz/common'

import type { ValidationRules } from '../../../../utils/validation'

/**
 * Validation rules for Classic MultiChoice questions.
 *
 * Applied by:
 * - `buildValidationModel` via `recomputeQuestionValidation`
 *
 * Notes:
 * - `options` is only checked for "required" by the shared validation builder.
 *   If you need stricter semantics (for example "at least 2 options" or
 *   "exactly 1 correct option"), that must be enforced elsewhere.
 */
const classicMultiChoiceRules: ValidationRules<QuestionMultiChoiceDto> = {
  type: { required: true },
  question: {
    required: true,
    minLength: QUIZ_QUESTION_TEXT_MIN_LENGTH,
    maxLength: QUIZ_QUESTION_TEXT_MAX_LENGTH,
    regex: QUIZ_QUESTION_TEXT_REGEX,
  },
  media: { required: false },
  options: { required: true },
  points: { required: true },
  duration: { required: true },
  info: {
    required: false,
    minLength: QUIZ_QUESTION_INFO_MIN_LENGTH,
    maxLength: QUIZ_QUESTION_INFO_MAX_LENGTH,
    regex: QUIZ_QUESTION_INFO_REGEX,
  },
}

/**
 * Validation rules for Classic True/False questions.
 *
 * Notes:
 * - `correct` is required (must be present). The shared validation builder does
 *   not enforce boolean type constraints beyond required-ness.
 */
const classicTrueFalseRules: ValidationRules<QuestionTrueFalseDto> = {
  type: { required: true },
  question: {
    required: true,
    minLength: QUIZ_QUESTION_TEXT_MIN_LENGTH,
    maxLength: QUIZ_QUESTION_TEXT_MAX_LENGTH,
    regex: QUIZ_QUESTION_TEXT_REGEX,
  },
  media: { required: false },
  correct: { required: true },
  points: { required: true },
  duration: { required: true },
  info: {
    required: false,
    minLength: QUIZ_QUESTION_INFO_MIN_LENGTH,
    maxLength: QUIZ_QUESTION_INFO_MAX_LENGTH,
    regex: QUIZ_QUESTION_INFO_REGEX,
  },
}

/**
 * Validation rules for Classic Range (slider) questions.
 *
 * Notes:
 * - This rule set marks `min`, `max`, and `correct` as required but does not
 *   enforce cross-field constraints (for example `min <= correct <= max`).
 *   Cross-field validation must be handled by a dedicated validator elsewhere.
 */
const classicRangeRules: ValidationRules<QuestionRangeDto> = {
  type: { required: true },
  question: {
    required: true,
    minLength: QUIZ_QUESTION_TEXT_MIN_LENGTH,
    maxLength: QUIZ_QUESTION_TEXT_MAX_LENGTH,
    regex: QUIZ_QUESTION_TEXT_REGEX,
  },
  media: { required: false },
  min: { required: true },
  max: { required: true },
  correct: { required: true },
  margin: { required: true },
  points: { required: true },
  duration: { required: true },
  info: {
    required: false,
    minLength: QUIZ_QUESTION_INFO_MIN_LENGTH,
    maxLength: QUIZ_QUESTION_INFO_MAX_LENGTH,
    regex: QUIZ_QUESTION_INFO_REGEX,
  },
}

/**
 * Validation rules for Classic TypeAnswer questions.
 *
 * Notes:
 * - `options` is only validated as required/non-empty. If you need constraints
 *   such as "at least 1 accepted answer" or normalization rules, validate that
 *   outside this model.
 */
const classicTypeAnswerRules: ValidationRules<QuestionTypeAnswerDto> = {
  type: { required: true },
  question: {
    required: true,
    minLength: QUIZ_QUESTION_TEXT_MIN_LENGTH,
    maxLength: QUIZ_QUESTION_TEXT_MAX_LENGTH,
    regex: QUIZ_QUESTION_TEXT_REGEX,
  },
  media: { required: false },
  options: { required: true },
  points: { required: true },
  duration: { required: true },
  info: {
    required: false,
    minLength: QUIZ_QUESTION_INFO_MIN_LENGTH,
    maxLength: QUIZ_QUESTION_INFO_MAX_LENGTH,
    regex: QUIZ_QUESTION_INFO_REGEX,
  },
}

/**
 * Validation rules for Classic Pin questions.
 *
 * Notes:
 * - `imageURL` is optional but must match `URL_REGEX` when present.
 * - `positionX` / `positionY` are required but range constraints (for example
 *   `0..1`) are not enforced by the shared validation builder.
 */
const classicPinRules: ValidationRules<QuestionPinDto> = {
  type: { required: true },
  question: {
    required: true,
    minLength: QUIZ_QUESTION_TEXT_MIN_LENGTH,
    maxLength: QUIZ_QUESTION_TEXT_MAX_LENGTH,
    regex: QUIZ_QUESTION_TEXT_REGEX,
  },
  imageURL: { required: false, regex: URL_REGEX },
  positionX: { required: true },
  positionY: { required: true },
  tolerance: { required: true },
  points: { required: true },
  duration: { required: true },
  info: {
    required: false,
    minLength: QUIZ_QUESTION_INFO_MIN_LENGTH,
    maxLength: QUIZ_QUESTION_INFO_MAX_LENGTH,
    regex: QUIZ_QUESTION_INFO_REGEX,
  },
}

/**
 * Validation rules for Classic Puzzle questions.
 *
 * Notes:
 * - `values` is only checked for "required" (non-empty array). If you need
 *   constraints such as required length, uniqueness, or value format, validate
 *   outside this rule model.
 */
const classicPuzzleRules: ValidationRules<QuestionPuzzleDto> = {
  type: { required: true },
  question: {
    required: true,
    minLength: QUIZ_QUESTION_TEXT_MIN_LENGTH,
    maxLength: QUIZ_QUESTION_TEXT_MAX_LENGTH,
    regex: QUIZ_QUESTION_TEXT_REGEX,
  },
  media: { required: false },
  values: { required: true },
  points: { required: true },
  duration: { required: true },
  info: {
    required: false,
    minLength: QUIZ_QUESTION_INFO_MIN_LENGTH,
    maxLength: QUIZ_QUESTION_INFO_MAX_LENGTH,
    regex: QUIZ_QUESTION_INFO_REGEX,
  },
}

/**
 * Validation rules for ZeroToOneHundred Range questions.
 *
 * Notes:
 * - `points` is intentionally not part of this DTO in your current model.
 * - Cross-field constraints (if any) are not handled here.
 * - The rule set is kept internal and exposed through
 *   `getRulesForZeroToOneHundredModeQuestionType`.
 */
const zeroToOneHundredRangeRules: ValidationRules<QuestionZeroToOneHundredRangeDto> =
  {
    type: { required: true },
    question: {
      required: true,
      minLength: QUIZ_QUESTION_TEXT_MIN_LENGTH,
      maxLength: QUIZ_QUESTION_TEXT_MAX_LENGTH,
      regex: QUIZ_QUESTION_TEXT_REGEX,
    },
    media: { required: false },
    correct: { required: true },
    duration: { required: true },
    info: {
      required: false,
      minLength: QUIZ_QUESTION_INFO_MIN_LENGTH,
      maxLength: QUIZ_QUESTION_INFO_MAX_LENGTH,
      regex: QUIZ_QUESTION_INFO_REGEX,
    },
  }

/**
 * Returns the Classic-mode rule set for a specific `QuestionType`.
 *
 * Purpose:
 * - Centralized mapping used by `recomputeQuestionValidation` to select the correct
 *   rule set for the current question `type`.
 *
 * Notes:
 * - This function is intentionally Classic-only; ZeroToOneHundred uses a separate
 *   mapping via `getRulesForZeroToOneHundredModeQuestionType`.
 * - If a type is not supported in Classic mode, this returns `undefined`.
 *
 * @param type - The question type discriminator.
 * @returns The matching Classic rule set, or `undefined` when the type is unknown/unsupported.
 */
export function getRulesForClassicModeQuestionType(
  type: QuestionType,
):
  | ValidationRules<
      | QuestionMultiChoiceDto
      | QuestionTrueFalseDto
      | QuestionRangeDto
      | QuestionTypeAnswerDto
      | QuestionPinDto
      | QuestionPuzzleDto
    >
  | undefined {
  switch (type) {
    case QuestionType.MultiChoice:
      return classicMultiChoiceRules
    case QuestionType.TrueFalse:
      return classicTrueFalseRules
    case QuestionType.Range:
      return classicRangeRules
    case QuestionType.TypeAnswer:
      return classicTypeAnswerRules
    case QuestionType.Pin:
      return classicPinRules
    case QuestionType.Puzzle:
      return classicPuzzleRules
    default:
      return undefined
  }
}

/**
 * Returns the ZeroToOneHundred-mode rule set for a specific `QuestionType`.
 *
 * Purpose:
 * - Centralized mapping used by `recomputeQuestionValidation` (or related utilities)
 *   to select the correct rule set for ZeroToOneHundred questions.
 *
 * Notes:
 * - ZeroToOneHundred currently supports only `QuestionType.Range`.
 * - If additional types are added for this mode, extend this mapping accordingly.
 *
 * @param type - The question type discriminator.
 * @returns The matching ZeroToOneHundred rule set, or `undefined` when unsupported.
 */
export function getRulesForZeroToOneHundredModeQuestionType(
  type: QuestionType,
): ValidationRules<QuestionZeroToOneHundredRangeDto> | undefined {
  if (type === QuestionType.Range) {
    return zeroToOneHundredRangeRules
  }
  return undefined
}
