import {
  CreateClassicModeQuestionMultiRequestDto,
  CreateClassicModeQuestionSliderRequestDto,
  CreateClassicModeQuestionTrueFalseRequestDto,
  CreateClassicModeQuestionTypeAnswerRequestDto,
  CreateZeroToOneHundredModeQuestionSliderRequestDto,
  GameMode,
  QuestionType,
} from '../models'

type QuestionRequest =
  | CreateClassicModeQuestionMultiRequestDto
  | CreateClassicModeQuestionTrueFalseRequestDto
  | CreateClassicModeQuestionSliderRequestDto
  | CreateClassicModeQuestionTypeAnswerRequestDto
  | CreateZeroToOneHundredModeQuestionSliderRequestDto

export const isCreateClassicModeQuestionMultiRequestDto = (
  mode: GameMode,
  request: QuestionRequest,
): request is CreateClassicModeQuestionMultiRequestDto => {
  return mode === GameMode.Classic && request.type === QuestionType.Multi
}

export const isCreateClassicModeQuestionSliderRequestDto = (
  mode: GameMode,
  request: QuestionRequest,
): request is CreateClassicModeQuestionSliderRequestDto => {
  return mode === GameMode.Classic && request.type === QuestionType.Slider
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

export const isCreateZeroToOneHundredModeQuestionSliderRequestDto = (
  mode: GameMode,
  request: QuestionRequest,
): request is CreateZeroToOneHundredModeQuestionSliderRequestDto => {
  return (
    mode === GameMode.ZeroToOneHundred && request.type === QuestionType.Slider
  )
}
