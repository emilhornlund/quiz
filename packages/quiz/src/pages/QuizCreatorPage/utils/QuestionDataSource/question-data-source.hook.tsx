import { GameMode, QuestionType } from '@quiz/common'
import { useCallback, useMemo, useState } from 'react'

import { QuestionData } from './question-data-source.types.ts'
import { createQuestionValidationModel } from './question-data-source.utils.ts'

type QuestionDataSourceReturnType = {
  questions: QuestionData[]
  selectedQuestion?: QuestionData
  selectedQuestionIndex: number
  selectQuestion: (index: number) => void
  addQuestion: (mode: GameMode, type: QuestionType) => void
  editQuestion: (data: QuestionData) => void
  dropQuestion: (index: number) => void
  duplicateQuestion: (index: number) => void
  deleteQuestion: (index: number) => void
  resetQuestions: (gameMode: GameMode, questions?: QuestionData[]) => void
}

export const useQuestionDataSource = (): QuestionDataSourceReturnType => {
  const [model, setModel] = useState<{
    questions: QuestionData[]
    selectedIndex: number
  }>({ questions: [], selectedIndex: -1 })

  const isValidIndex = useCallback(
    (index: number): boolean => index >= 0 && index < model.questions.length,
    [model],
  )

  const questions = useMemo<QuestionData[]>(() => model.questions, [model])

  const selectedQuestion = useMemo<QuestionData | undefined>(() => {
    if (isValidIndex(model.selectedIndex)) {
      return model.questions[model.selectedIndex]
    }
    return undefined
  }, [model, isValidIndex])

  const selectedQuestionIndex = useMemo<number>(
    () => model.selectedIndex,
    [model],
  )

  const selectQuestion = (index: number): void => {
    if (!isValidIndex(index)) {
      throw new Error('Invalid question index')
    }

    setModel((prevModel) => ({ ...prevModel, selectedIndex: index }))
  }

  const editQuestion = (data: QuestionData): void => {
    setModel((prevModel) => {
      const { selectedIndex, questions } = prevModel

      if (!isValidIndex(selectedIndex)) {
        throw new Error('Invalid question index')
      }

      const currentQuestion = questions[selectedIndex]

      const updatedQuestions = [...questions]
      updatedQuestions[selectedIndex] = {
        ...currentQuestion,
        ...data,
      } as QuestionData

      return {
        ...prevModel,
        questions: updatedQuestions,
      }
    })
  }

  const addQuestion = (mode: GameMode, type: QuestionType): void => {
    setModel((prevModel) => ({
      ...prevModel,
      questions: [
        ...prevModel.questions,
        createQuestionValidationModel(mode, type),
      ],
      selectedIndex: prevModel.questions.length,
    }))
  }

  const dropQuestion = (index: number): void => {
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
  }

  const duplicateQuestion = (index: number): void => {
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
  }

  const deleteQuestion = (index: number): void => {
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
  }

  const resetQuestions = (
    gameMode: GameMode,
    questions?: QuestionData[],
  ): void => {
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
  }

  return {
    questions,
    selectedQuestion,
    selectedQuestionIndex,
    selectQuestion,
    addQuestion,
    editQuestion,
    dropQuestion,
    duplicateQuestion,
    deleteQuestion,
    resetQuestions,
  }
}
