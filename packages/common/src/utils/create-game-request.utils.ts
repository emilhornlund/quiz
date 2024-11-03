import {
  CreateClassicModeQuestionMultiChoiceRequestDto,
  CreateClassicModeQuestionSliderRequestDto,
  CreateClassicModeQuestionTrueFalseRequestDto,
  CreateClassicModeQuestionTypeAnswerRequestDto,
  CreateZeroToOneHundredModeQuestionRangeRequestDto,
  GameMode,
  QuestionType,
} from '../models'

type QuestionRequest =
  | CreateClassicModeQuestionMultiChoiceRequestDto
  | CreateClassicModeQuestionTrueFalseRequestDto
  | CreateClassicModeQuestionSliderRequestDto
  | CreateClassicModeQuestionTypeAnswerRequestDto
  | CreateZeroToOneHundredModeQuestionRangeRequestDto

export const isCreateClassicModeQuestionMultiChoiceRequestDto = (
  mode: GameMode,
  request: QuestionRequest,
): request is CreateClassicModeQuestionMultiChoiceRequestDto => {
  return mode === GameMode.Classic && request.type === QuestionType.MultiChoice
}

export const isCreateClassicModeQuestionSliderRequestDto = (
  mode: GameMode,
  request: QuestionRequest,
): request is CreateClassicModeQuestionSliderRequestDto => {
  return mode === GameMode.Classic && request.type === QuestionType.Range
}

export const isCreateClassicModeQuestionTrueFalseRequestDto = (
  mode: GameMode,
  request: QuestionRequest,
): request is CreateClassicModeQuestionTrueFalseRequestDto => {
  return mode === GameMode.Classic && request.type === QuestionType.TrueFalse
}

export const isCreateClassicModeQuestionTypeAnswerRequestDto = (
  mode: GameMode,
  request: QuestionRequest,
): request is CreateClassicModeQuestionTypeAnswerRequestDto => {
  return mode === GameMode.Classic && request.type === QuestionType.TypeAnswer
}

export const isCreateZeroToOneHundredModeQuestionRangeRequestDto = (
  mode: GameMode,
  request: QuestionRequest,
): request is CreateZeroToOneHundredModeQuestionRangeRequestDto => {
  return (
    mode === GameMode.ZeroToOneHundred && request.type === QuestionType.Range
  )
}
