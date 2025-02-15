import {
  GameMode,
  QuestionMultiChoiceDto,
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
  [GameMode.ZeroToOneHundred]: QuestionZeroToOneHundredRangeDto
}

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
