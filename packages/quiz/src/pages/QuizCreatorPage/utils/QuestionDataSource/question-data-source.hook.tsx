import {
  GameMode,
  QuestionMultiChoiceDto,
  QuestionPinDto,
  QuestionPinTolerance,
  QuestionPuzzleDto,
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
import {
  createQuestionValidationModel,
  recomputeQuestionValidation,
} from './question-data-source.utils.ts'

/**
 * Return contract for `useQuestionDataSource`.
 *
 * Provides a small state machine for authoring questions in the quiz creator UI:
 * - Owns the question list.
 * - Tracks a selected question index.
 * - Supports CRUD operations and type replacement.
 * - Maintains per-field validation booleans on each question.
 */
type QuestionDataSourceReturnType = {
  /**
   * Current list of question models.
   *
   * Each item contains:
   * - `mode` (Classic / ZeroToOneHundred)
   * - `data` (question payload for the chosen type)
   * - `validation` (per-field validity map)
   */
  questions: QuestionData[]

  /**
   * Replaces the full question list.
   *
   * Behavior:
   * - Recomputes validation for each question.
   * - Resets selection to index 0 when the array is non-empty; otherwise sets selection to -1.
   */
  setQuestions: (questions: QuestionData[]) => void

  /**
   * Aggregated validity across all questions.
   *
   * `true` when no question contains a `false` value in its `validation` map.
   */
  allQuestionsValid: boolean

  /**
   * The currently selected question, if the selection index is valid.
   */
  selectedQuestion?: QuestionData

  /**
   * The current selected question index.
   *
   * Notes:
   * - `-1` indicates "no selection".
   */
  selectedQuestionIndex: number

  /**
   * Selects a question by index.
   *
   * Throws:
   * - `Error` when the index is out of bounds.
   */
  selectQuestion: (index: number) => void

  /**
   * Appends a new question for the given game mode + question type and selects it.
   *
   * The new question uses default values from `createQuestionValidationModel`.
   */
  addQuestion: (mode: GameMode, type: QuestionType) => void

  /**
   * Updates a field on the currently selected question `data` and recomputes validation.
   *
   * Throws:
   * - `Error` if no valid selection exists.
   */
  setQuestionValue: QuestionValueChangeFunction

  /**
   * Updates a single validity flag on the currently selected question without recomputing.
   *
   * Intended for inputs that validate locally and want to push the result into the model.
   *
   * Throws:
   * - `Error` if no valid selection exists.
   */
  setQuestionValueValid: QuestionValueValidChangeFunction

  /**
   * Swaps the currently selected question with the question at `index`.
   *
   * Use-case:
   * - "Drop" a question onto another slot in the UI to reorder.
   *
   * Throws:
   * - `Error` when the index is out of bounds.
   */
  dropQuestion: (index: number) => void

  /**
   * Duplicates the question at `index` by inserting a copy immediately after it.
   *
   * Note:
   * - This currently inserts the same object reference (shallow). If you later mutate nested
   *   structures in-place, you may want a deep clone instead.
   *
   * Throws:
   * - `Error` when the index is out of bounds.
   */
  duplicateQuestion: (index: number) => void

  /**
   * Deletes the question at `index` and updates selection.
   *
   * Selection behavior:
   * - If questions remain, selects `min(index, lastIndex)`.
   * - If no questions remain, sets selection to `-1`.
   *
   * Throws:
   * - `Error` when the index is out of bounds.
   */
  deleteQuestion: (index: number) => void

  /**
   * Replaces the currently selected question with a new question of the provided `type`,
   * preserving shared fields where possible (question text, points, duration, info, media).
   *
   * Supported transitions:
   * - Classic: MultiChoice, TrueFalse, Range, TypeAnswer, Pin, Puzzle
   * - ZeroToOneHundred: Range
   *
   * Throws:
   * - `Error` if no valid selection exists.
   */
  replaceQuestion: (type: QuestionType) => void

  /**
   * Resets the question list for a given game mode.
   *
   * Behavior:
   * - If `questions` is provided: uses it and recomputes validation.
   * - Otherwise: initializes with a single default question appropriate for the mode:
   *   - Classic -> MultiChoice
   *   - ZeroToOneHundred -> Range
   *
   * Selection behavior:
   * - Selects index 0 when non-empty; otherwise -1.
   */
  resetQuestions: (gameMode: GameMode, questions?: QuestionData[]) => void
}

/**
 * React hook for managing the quiz creator "question authoring" model.
 *
 * Responsibilities:
 * - Stores a list of `QuestionData` entries and a selected index.
 * - Enforces index validity for selection-dependent operations.
 * - Centralizes the validation lifecycle by recomputing validation on data updates.
 *
 * Invariants:
 * - `selectedIndex` is either `-1` (no selection) or a valid index into `questions`.
 * - `questions[i].validation` contains per-field validity flags; `false` represents invalid.
 */
export const useQuestionDataSource = (): QuestionDataSourceReturnType => {
  const [model, setModel] = useState<{
    questions: QuestionData[]
    selectedIndex: number
  }>({ questions: [], selectedIndex: -1 })

  /**
   * Checks whether an index is within the bounds of the current question list.
   */
  const isValidIndex = useCallback(
    (index: number): boolean => index >= 0 && index < model.questions.length,
    [model.questions],
  )

  const questions = useMemo<QuestionData[]>(() => model.questions, [model])

  const setQuestions = useCallback((questions: QuestionData[]) => {
    setModel({
      questions: questions.map(recomputeQuestionValidation),
      selectedIndex: questions.length ? 0 : -1,
    })
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
        | QuestionPinDto
        | QuestionPuzzleDto
        | QuestionZeroToOneHundredRangeDto,
    >(
      key: keyof T,
      value?: T[keyof T],
    ) => {
      setModel((prevModel) => {
        const { selectedIndex, questions } = prevModel

        if (!isValidIndex(selectedIndex)) {
          throw new Error('Invalid question index')
        }

        const currentQuestion = questions[selectedIndex]

        const updatedQuestion = recomputeQuestionValidation({
          ...currentQuestion,
          data: { ...currentQuestion.data, [key]: value },
        } as QuestionData)

        const updatedQuestions = [...questions]
        updatedQuestions[selectedIndex] = updatedQuestion

        return { ...prevModel, questions: updatedQuestions }
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
        | QuestionPinDto
        | QuestionPuzzleDto
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

  const deepClone = <T,>(value: T): T => {
    if (typeof structuredClone === 'function') {
      return structuredClone(value)
    }

    return JSON.parse(JSON.stringify(value)) as T
  }

  const duplicateQuestion = useCallback(
    (index: number) => {
      setModel((prevModel) => {
        if (!isValidIndex(index)) {
          throw new Error('Invalid question index')
        }

        const questions = prevModel.questions
        const original = questions[index]
        const duplicated = deepClone(original)

        const updatedQuestions = [...questions]
        updatedQuestions.splice(index + 1, 0, duplicated)

        return {
          ...prevModel,
          questions: updatedQuestions,
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
            updatedQuestions[selectedIndex] = recomputeQuestionValidation({
              mode: GameMode.Classic,
              data: {
                type,
                question: currentQuestion.data.question,
                options: [],
                points: currentQuestion.data.points,
                duration: currentQuestion.data.duration,
                info: currentQuestion.data.info,
              },
              validation: {},
            })
          }
          if (type === QuestionType.TrueFalse) {
            updatedQuestions[selectedIndex] = recomputeQuestionValidation({
              mode: GameMode.Classic,
              data: {
                type,
                question: currentQuestion.data.question,
                points: currentQuestion.data.points,
                duration: currentQuestion.data.duration,
                info: currentQuestion.data.info,
              },
              validation: {},
            })
          }
          if (type === QuestionType.Range) {
            updatedQuestions[selectedIndex] = recomputeQuestionValidation({
              mode: GameMode.Classic,
              data: {
                type,
                question: currentQuestion.data.question,
                min: 0,
                max: 100,
                correct: 0,
                margin: QuestionRangeAnswerMargin.Medium,
                points: currentQuestion.data.points,
                duration: currentQuestion.data.duration,
                info: currentQuestion.data.info,
              },
              validation: {},
            })
          }
          if (type === QuestionType.TypeAnswer) {
            updatedQuestions[selectedIndex] = recomputeQuestionValidation({
              mode: GameMode.Classic,
              data: {
                type,
                question: currentQuestion.data.question,
                options: [],
                points: currentQuestion.data.points,
                duration: currentQuestion.data.duration,
                info: currentQuestion.data.info,
              },
              validation: {},
            })
          }
          if (type === QuestionType.Pin) {
            updatedQuestions[selectedIndex] = recomputeQuestionValidation({
              mode: GameMode.Classic,
              data: {
                type,
                question: currentQuestion.data.question,
                positionX: 0.5,
                positionY: 0.5,
                tolerance: QuestionPinTolerance.Medium,
                points: currentQuestion.data.points,
                duration: currentQuestion.data.duration,
                info: currentQuestion.data.info,
              },
              validation: {},
            })
          }
          if (type === QuestionType.Puzzle) {
            updatedQuestions[selectedIndex] = recomputeQuestionValidation({
              mode: GameMode.Classic,
              data: {
                type,
                question: currentQuestion.data.question,
                points: currentQuestion.data.points,
                duration: currentQuestion.data.duration,
                info: currentQuestion.data.info,
              },
              validation: {},
            })
          }
        } else if (currentQuestion.mode === GameMode.ZeroToOneHundred) {
          if (type === QuestionType.Range) {
            updatedQuestions[selectedIndex] = recomputeQuestionValidation({
              mode: GameMode.ZeroToOneHundred,
              data: {
                type,
                question: currentQuestion.data.question,
                media: currentQuestion.data.media,
                correct: 0,
                duration: currentQuestion.data.duration,
                info: currentQuestion.data.info,
              },
              validation: {},
            })
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
      const initialQuestions =
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
            ])

      setModel((prevModel) => ({
        ...prevModel,
        questions: initialQuestions.map(recomputeQuestionValidation),
        selectedIndex: initialQuestions.length ? 0 : -1,
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
