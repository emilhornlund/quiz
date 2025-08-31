import {
  GameMode,
  QuestionMultiChoiceDto,
  QuestionPinDto,
  QuestionPuzzleDto,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionTypeAnswerDto,
  QuestionZeroToOneHundredRangeDto,
} from '@quiz/common'

export type QuestionDataMapping = {
  [GameMode.Classic]:
    | QuestionMultiChoiceDto
    | QuestionRangeDto
    | QuestionTrueFalseDto
    | QuestionTypeAnswerDto
    | QuestionPinDto
    | QuestionPuzzleDto
  [GameMode.ZeroToOneHundred]: QuestionZeroToOneHundredRangeDto
}

export type QuestionValueChangeFunction = <
  T extends
    | QuestionMultiChoiceDto
    | QuestionRangeDto
    | QuestionTrueFalseDto
    | QuestionTypeAnswerDto
    | QuestionPinDto
    | QuestionPuzzleDto
    | QuestionZeroToOneHundredRangeDto,
>(
  key: keyof T,
  value?: T[keyof T],
) => void

export type QuestionValueValidChangeFunction = <
  T extends
    | QuestionMultiChoiceDto
    | QuestionRangeDto
    | QuestionTrueFalseDto
    | QuestionTypeAnswerDto
    | QuestionPinDto
    | QuestionPuzzleDto
    | QuestionZeroToOneHundredRangeDto,
>(
  key: keyof T,
  valid: boolean,
) => void

export type QuestionValidationModel<T extends GameMode> = {
  mode: T
  data: Partial<QuestionDataMapping[T]>
  validation: { [key in keyof QuestionDataMapping[T]]?: boolean }
}

export type ClassicModeQuestionValidationModel =
  QuestionValidationModel<GameMode.Classic>

export type ZeroToOneHundredModeQuestionValidationModel =
  QuestionValidationModel<GameMode.ZeroToOneHundred>

export type QuestionData =
  | ClassicModeQuestionValidationModel
  | ZeroToOneHundredModeQuestionValidationModel
