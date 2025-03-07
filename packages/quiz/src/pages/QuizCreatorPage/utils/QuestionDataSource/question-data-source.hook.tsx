import {
  GameMode,
  QuestionMultiChoiceDto,
  QuestionRangeAnswerMargin,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionType,
  QuestionTypeAnswerDto,
  QuestionZeroToOneHundredRangeDto,
} from '@quiz/common'
import { useCallback, useMemo, useState } from 'react'

import {
  QuestionData,
  QuestionValueChangeFunction,
  QuestionValueValidChangeFunction,
} from './question-data-source.types.ts'
import { createQuestionValidationModel } from './question-data-source.utils.ts'

type QuestionDataSourceReturnType = {
  questions: QuestionData[]
  setQuestions: (questions: QuestionData[]) => void
  allQuestionsValid: boolean
  selectedQuestion?: QuestionData
  selectedQuestionIndex: number
  selectQuestion: (index: number) => void
  addQuestion: (mode: GameMode, type: QuestionType) => void
  setQuestionValue: QuestionValueChangeFunction
  setQuestionValueValid: QuestionValueValidChangeFunction
  dropQuestion: (index: number) => void
  duplicateQuestion: (index: number) => void
  deleteQuestion: (index: number) => void
  replaceQuestion: (type: QuestionType) => void
  resetQuestions: (gameMode: GameMode, questions?: QuestionData[]) => void
}

export const useQuestionDataSource = (): QuestionDataSourceReturnType => {
  const [model, setModel] = useState<{
    questions: QuestionData[]
    selectedIndex: number
  }>({ questions: [], selectedIndex: -1 })

  const isValidIndex = useCallback(
    (index: number): boolean => index >= 0 && index < model.questions.length,
    [model.questions],
  )

  const questions = useMemo<QuestionData[]>(() => model.questions, [model])

  const setQuestions = useCallback((questions: QuestionData[]) => {
    setModel({ questions, selectedIndex: 0 })
  }, [])

  const allQuestionsValid = useMemo(
    () =>
      model.questions.every(
        ({ validation }) =>
          !Object.values(validation).some((valid) => valid === false),
      ),
    [model],
  )

  const selectedQuestion = useMemo<QuestionData | undefined>(() => {
    if (isValidIndex(model.selectedIndex)) {
      return model.questions[model.selectedIndex]
    }
    return undefined
  }, [model.selectedIndex, model.questions, isValidIndex])

  const selectedQuestionIndex = useMemo<number>(
    () => model.selectedIndex,
    [model.selectedIndex],
  )

  const selectQuestion = useCallback(
    (index: number): void => {
      if (!isValidIndex(index)) {
        throw new Error('Invalid question index')
      }

      setModel((prevModel) => ({ ...prevModel, selectedIndex: index }))
    },
    [isValidIndex],
  )

  const setQuestionValue = useCallback(
    <
      T extends
        | QuestionMultiChoiceDto
        | QuestionRangeDto
        | QuestionTrueFalseDto
        | QuestionTypeAnswerDto
        | QuestionZeroToOneHundredRangeDto,
    >(
      key: keyof T,
      value: T[keyof T],
    ) => {
      setModel((prevModel) => {
        const { selectedIndex, questions } = prevModel

        if (!isValidIndex(selectedIndex)) {
          throw new Error('Invalid question index')
        }

        const currentQuestion = questions[selectedIndex]

        const updatedQuestions = [...questions]
        updatedQuestions[selectedIndex] = {
          ...currentQuestion,
          data: { ...currentQuestion.data, [key]: value },
          validation: {
            ...currentQuestion.validation,
          },
        } as QuestionData

        return {
          ...prevModel,
          questions: updatedQuestions,
        }
      })
    },
    [isValidIndex],
  )

  const setQuestionValueValid = useCallback(
    <
      T extends
        | QuestionMultiChoiceDto
        | QuestionRangeDto
        | QuestionTrueFalseDto
        | QuestionTypeAnswerDto
        | QuestionZeroToOneHundredRangeDto,
    >(
      key: keyof T,
      valid: boolean,
    ) => {
      setModel((prevModel) => {
        const { selectedIndex, questions } = prevModel

        if (!isValidIndex(selectedIndex)) {
          throw new Error('Invalid question index')
        }

        const currentQuestion = questions[selectedIndex]

        const updatedQuestions = [...questions]
        updatedQuestions[selectedIndex] = {
          ...currentQuestion,
          data: { ...currentQuestion.data },
          validation: {
            ...currentQuestion.validation,
            [key]: valid,
          },
        } as QuestionData

        return {
          ...prevModel,
          questions: updatedQuestions,
        }
      })
    },
    [isValidIndex],
  )

  const addQuestion = useCallback(
    (mode: GameMode, type: QuestionType): void => {
      setModel((prevModel) => ({
        ...prevModel,
        questions: [
          ...prevModel.questions,
          createQuestionValidationModel(mode, type),
        ],
        selectedIndex: prevModel.questions.length,
      }))
    },
    [],
  )

  const dropQuestion = useCallback(
    (index: number): void => {
      if (!isValidIndex(index)) {
        throw new Error('Invalid question index')
      }

      setModel((prevModel) => {
        const newQuestions = [...prevModel.questions]

        ;[newQuestions[prevModel.selectedIndex], newQuestions[index]] = [
          newQuestions[index],
          newQuestions[prevModel.selectedIndex],
        ]

        return {
          ...prevModel,
          questions: newQuestions,
          selectedIndex: index,
        }
      })
    },
    [isValidIndex],
  )

  const duplicateQuestion = useCallback(
    (index: number): void => {
      if (!isValidIndex(index)) {
        throw new Error('Invalid question index')
      }

      setModel((prevModel) => {
        const newQuestions = [...prevModel.questions]
        newQuestions.splice(index + 1, 0, prevModel.questions[index])

        return {
          ...prevModel,
          questions: newQuestions,
          selectedIndex: index,
        }
      })
    },
    [isValidIndex],
  )

  const deleteQuestion = useCallback(
    (index: number): void => {
      if (!isValidIndex(index)) {
        throw new Error('Invalid question index')
      }

      setModel((prevModel) => {
        const newQuestions = [...prevModel.questions]
        newQuestions.splice(index, 1)

        return {
          ...prevModel,
          questions: newQuestions,
          selectedIndex: newQuestions.length
            ? Math.min(index, newQuestions.length - 1)
            : -1,
        }
      })
    },
    [isValidIndex],
  )

  // TODO: replaceQuestion() => use when change type

  const replaceQuestion = useCallback(
    (type: QuestionType) => {
      setModel((prevModel) => {
        const { selectedIndex, questions } = prevModel

        if (!isValidIndex(selectedIndex)) {
          throw new Error('Invalid question index')
        }

        const currentQuestion = questions[selectedIndex]

        const updatedQuestions = [...questions]

        if (currentQuestion.mode === GameMode.Classic) {
          if (type === QuestionType.MultiChoice) {
            updatedQuestions[selectedIndex] = {
              mode: GameMode.Classic,
              data: {
                type,
                question: currentQuestion.data.question,
                media: currentQuestion.data.media,
                options: [],
                points: currentQuestion.data.points,
                duration: currentQuestion.data.duration,
              },
              validation: {},
            }
          }
          if (type === QuestionType.TrueFalse) {
            updatedQuestions[selectedIndex] = {
              mode: GameMode.Classic,
              data: {
                type,
                question: currentQuestion.data.question,
                media: currentQuestion.data.media,
                points: currentQuestion.data.points,
                duration: currentQuestion.data.duration,
              },
              validation: {},
            }
          }
          if (type === QuestionType.Range) {
            updatedQuestions[selectedIndex] = {
              mode: GameMode.Classic,
              data: {
                type,
                question: currentQuestion.data.question,
                media: currentQuestion.data.media,
                min: 0,
                max: 100,
                correct: 0,
                margin: QuestionRangeAnswerMargin.Medium,
                points: currentQuestion.data.points,
                duration: currentQuestion.data.duration,
              },
              validation: {},
            }
          }
          if (type === QuestionType.TypeAnswer) {
            updatedQuestions[selectedIndex] = {
              mode: GameMode.Classic,
              data: {
                type,
                question: currentQuestion.data.question,
                media: currentQuestion.data.media,
                options: [],
                points: currentQuestion.data.points,
                duration: currentQuestion.data.duration,
              },
              validation: {},
            }
          }
        } else if (currentQuestion.mode === GameMode.ZeroToOneHundred) {
          if (type === QuestionType.Range) {
            updatedQuestions[selectedIndex] = {
              mode: GameMode.Classic,
              data: {
                type,
                question: currentQuestion.data.question,
                media: currentQuestion.data.media,
                correct: 0,
                duration: currentQuestion.data.duration,
              },
              validation: {},
            }
          }
        }

        return {
          ...prevModel,
          questions: updatedQuestions,
        }
      })
    },
    [isValidIndex],
  )

  const resetQuestions = useCallback(
    (gameMode: GameMode, questions?: QuestionData[]): void => {
      setModel((prevModel) => ({
        ...prevModel,
        questions:
          questions ||
          (gameMode === GameMode.Classic
            ? [
                createQuestionValidationModel(
                  GameMode.Classic,
                  QuestionType.MultiChoice,
                ),
              ]
            : [
                createQuestionValidationModel(
                  GameMode.ZeroToOneHundred,
                  QuestionType.Range,
                ),
              ]),
        selectedIndex: 0,
      }))
    },
    [],
  )

  return {
    questions,
    setQuestions,
    allQuestionsValid,
    selectedQuestion,
    selectedQuestionIndex,
    selectQuestion,
    addQuestion,
    setQuestionValue,
    setQuestionValueValid,
    dropQuestion,
    duplicateQuestion,
    deleteQuestion,
    replaceQuestion,
    resetQuestions,
  }
}
