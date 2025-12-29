/**
 * Runtime map of question field identifiers used by the quiz editor and
 * validation logic.
 *
 * These values identify which logical field of a question is being read,
 * updated, validated, or reported on, across all supported question types.
 */
export const QuestionFieldType = {
  CommonDuration: 'DURATION',
  CommonInfo: 'INFO',
  CommonMedia: 'MEDIA',
  CommonPoints: 'POINTS',
  CommonQuestion: 'QUESTION',
  CommonType: 'TYPE',

  MultiChoiceOptions: 'MULTI_CHOICE_OPTIONS',

  Pin: 'PIN',
  PinTolerance: 'PIN_TOLERANCE',

  PuzzleValues: 'PUZZLE_VALUES',

  Range: 'RANGE',
  RangeCorrect: 'CORRECT',
  RangeMargin: 'MARGIN',
  RangeMax: 'MAX',
  RangeMin: 'MIN',

  TrueFalseOptions: 'TRUE_FALSE_OPTIONS',

  TypeAnswerOptions: 'TYPE_ANSWER_OPTIONS',
} as const

/**
 * Identifies a specific editable or validatable field within a quiz question.
 *
 * This type is used to:
 * - Target individual fields for validation errors
 * - Drive editor UI behavior
 * - Associate error messages with specific question fields
 *
 * The set spans common fields shared by all questions, as well as
 * question-type-specific fields.
 */
export type QuestionFieldType =
  (typeof QuestionFieldType)[keyof typeof QuestionFieldType]
