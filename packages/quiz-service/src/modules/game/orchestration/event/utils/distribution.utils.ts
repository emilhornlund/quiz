import {
  arraysEqual,
  GameEventQuestionResults,
  isDefined,
  QuestionType,
} from '@quiz/common'

import {
  isMultiChoiceAnswer,
  isMultiChoiceCorrectAnswer,
  isPinAnswer,
  isPinCorrectAnswer,
  isPuzzleAnswer,
  isPuzzleCorrectAnswer,
  isRangeAnswer,
  isRangeCorrectAnswer,
  isTrueFalseAnswer,
  isTrueFalseCorrectAnswer,
  isTypeAnswerAnswer,
  isTypeAnswerCorrectAnswer,
} from '../../../../game-core/orchestration/question-answer-type-guards'
import {
  QuestionResultTaskCorrectAnswer,
  QuestionResultTaskItem,
} from '../../../../game-core/repositories/models/schemas'
import {
  QuestionMultiChoiceWithBase,
  QuestionPinWithBase,
  QuestionPuzzleWithBase,
  QuestionRangeWithBase,
} from '../../../../quiz/repositories/models/schemas'

/**
 * Creates the answer distribution for a MultiChoice question result event.
 *
 * Counts how many players selected each option, ensuring all correct options are present
 * (with a zero count if nobody picked them). Invalid option indices are ignored.
 *
 * The resulting distribution is sorted by:
 * 1) correct answers first,
 * 2) higher count first,
 * 3) lower option index first.
 *
 * @param question - The MultiChoice question definition, including its option list.
 * @param results - Per-player question result items to aggregate into counts.
 * @param correctAnswers - The correct answer entries for the question, used to seed the distribution.
 *
 * @returns A `GameEventQuestionResults` payload containing the MultiChoice distribution.
 */
export function createMultiChoiceQuestionResultDistribution(
  question: QuestionMultiChoiceWithBase,
  results: QuestionResultTaskItem[],
  correctAnswers: QuestionResultTaskCorrectAnswer[],
): GameEventQuestionResults {
  return {
    type: QuestionType.MultiChoice,
    distribution: results
      .reduce(
        (prev, playerResultItem) => {
          if (isMultiChoiceAnswer(playerResultItem.answer)) {
            const optionIndex = playerResultItem.answer.answer
            const distributionIndex = prev.findIndex(
              (item) => item.index === optionIndex,
            )
            if (distributionIndex >= 0) {
              prev[distributionIndex].count += 1
            } else if (
              optionIndex >= 0 &&
              optionIndex < question.options.length
            ) {
              prev.push({
                value: question.options[optionIndex].value,
                count: 1,
                correct: playerResultItem.correct,
                index: optionIndex,
              })
            }
          }
          return prev
        },
        correctAnswers
          .filter(isMultiChoiceCorrectAnswer)
          .map(({ index: optionIndex }) =>
            optionIndex >= 0 && optionIndex < question.options.length
              ? {
                  value: question.options[optionIndex].value,
                  count: 0,
                  correct: true,
                  index: optionIndex,
                }
              : undefined,
          )
          .filter(isDefined),
      )
      .sort((a, b) => {
        if (a.correct !== b.correct) {
          return a.correct ? -1 : 1
        }
        if (a.count !== b.count) {
          return b.count - a.count
        }
        return a.index - b.index
      }),
  }
}

/**
 * Creates the answer distribution for a Range question result event.
 *
 * Counts how many players submitted each numeric value. Answers outside the configured
 * `[min, max]` bounds are ignored. The distribution is seeded with the correct value so it
 * appears even when no player selected it.
 *
 * The resulting distribution is sorted by:
 * 1) correct answers first,
 * 2) higher count first.
 *
 * @param question - The Range question definition, including `min` and `max` bounds.
 * @param results - Per-player question result items to aggregate into counts.
 * @param correctAnswers - The correct answer entries for the question, used to seed the distribution.
 *
 * @returns A `GameEventQuestionResults` payload containing the Range distribution.
 */
export function createRangeQuestionResultDistribution(
  question: QuestionRangeWithBase,
  results: QuestionResultTaskItem[],
  correctAnswers: QuestionResultTaskCorrectAnswer[],
): GameEventQuestionResults {
  return {
    type: QuestionType.Range,
    distribution: results
      .reduce(
        (prev, playerResultItem) => {
          if (isRangeAnswer(playerResultItem.answer)) {
            const answer = playerResultItem.answer.answer
            const distributionIndex = prev.findIndex(
              (item) => item.value === answer,
            )
            if (distributionIndex >= 0) {
              prev[distributionIndex].count += 1
            } else if (answer >= question.min && answer <= question.max) {
              prev.push({
                value: answer,
                count: 1,
                correct: playerResultItem.correct,
              })
            }
          }
          return prev
        },
        correctAnswers.filter(isRangeCorrectAnswer).map(({ value }) => ({
          value,
          count: 0,
          correct: true,
        })),
      )
      .sort((a, b) => {
        if (a.correct !== b.correct) {
          return a.correct ? -1 : 1
        }
        return b.count - a.count
      }),
  }
}

/**
 * Creates the answer distribution for a True/False question result event.
 *
 * Counts how many players answered `true` vs `false`. The distribution is seeded with the
 * correct value so it appears even when no player selected it.
 *
 * The resulting distribution is sorted by:
 * 1) correct answers first,
 * 2) higher count first.
 *
 * @param results - Per-player question result items to aggregate into counts.
 * @param correctAnswers - The correct answer entries for the question, used to seed the distribution.
 *
 * @returns A `GameEventQuestionResults` payload containing the True/False distribution.
 */
export function createTrueFalseQuestionResultDistribution(
  results: QuestionResultTaskItem[],
  correctAnswers: QuestionResultTaskCorrectAnswer[],
): GameEventQuestionResults {
  return {
    type: QuestionType.TrueFalse,
    distribution: results
      .reduce(
        (prev, playerResultItem) => {
          if (isTrueFalseAnswer(playerResultItem.answer)) {
            const answer = playerResultItem.answer.answer
            const distributionIndex = prev.findIndex(
              (item) => item.value === answer,
            )
            if (distributionIndex >= 0) {
              prev[distributionIndex].count += 1
            } else {
              prev.push({
                value: answer,
                count: 1,
                correct: playerResultItem.correct,
              })
            }
          }
          return prev
        },
        correctAnswers.filter(isTrueFalseCorrectAnswer).map(({ value }) => ({
          value,
          count: 0,
          correct: true,
        })),
      )
      .sort((a, b) => {
        if (a.correct !== b.correct) {
          return a.correct ? -1 : 1
        }
        return b.count - a.count
      }),
  }
}

/**
 * Creates the answer distribution for a TypeAnswer question result event.
 *
 * Aggregates free-text answers case-insensitively by normalizing values to lowercase.
 * Empty answers are ignored. The distribution is seeded with the correct value so it
 * appears even when no player submitted it.
 *
 * The resulting distribution is sorted by:
 * 1) correct answers first,
 * 2) higher count first.
 *
 * @param results - Per-player question result items to aggregate into counts.
 * @param correctAnswers - The correct answer entries for the question, used to seed the distribution.
 *
 * @returns A `GameEventQuestionResults` payload containing the TypeAnswer distribution.
 */
export function createTypeAnswerQuestionResultDistribution(
  results: QuestionResultTaskItem[],
  correctAnswers: QuestionResultTaskCorrectAnswer[],
): GameEventQuestionResults {
  return {
    type: QuestionType.TypeAnswer,
    distribution: results
      .reduce(
        (prev, playerResultItem) => {
          if (isTypeAnswerAnswer(playerResultItem.answer)) {
            const answer = playerResultItem.answer.answer
            const distributionIndex = prev.findIndex(
              (item) => item.value.toLowerCase() === answer.toLowerCase(),
            )
            if (distributionIndex >= 0) {
              prev[distributionIndex].count += 1
            } else if (answer?.length > 0) {
              prev.push({
                value: answer.toLowerCase(),
                count: 1,
                correct: playerResultItem.correct,
              })
            }
          }
          return prev
        },
        correctAnswers.filter(isTypeAnswerCorrectAnswer).map(({ value }) => ({
          value: value.toLowerCase(),
          count: 0,
          correct: true,
        })),
      )
      .sort((a, b) => {
        if (a.correct !== b.correct) {
          return a.correct ? -1 : 1
        }
        return b.count - a.count
      }),
  }
}

/**
 * Creates the answer distribution for a Pin question result event.
 *
 * Aggregates submitted pin coordinates as strings in the format `"x,y"`, where both `x` and `y`
 * are normalized coordinates in the inclusive range `[0, 1]`. Inputs that do not match this
 * format are ignored. The distribution is seeded with the correct value so it appears even
 * when no player submitted it.
 *
 * The resulting distribution is sorted by:
 * 1) correct answers first,
 * 2) higher count first.
 *
 * @param question - The Pin question definition, including image metadata and tolerance.
 * @param results - Per-player question result items to aggregate into counts.
 * @param correctAnswers - The correct answer entries for the question, used to seed the distribution.
 *
 * @returns A `GameEventQuestionResults` payload containing the Pin distribution and pin metadata.
 */
export function createPinQuestionResultDistribution(
  question: QuestionPinWithBase,
  results: QuestionResultTaskItem[],
  correctAnswers: QuestionResultTaskCorrectAnswer[],
): GameEventQuestionResults {
  return {
    type: QuestionType.Pin,
    imageURL: question.imageURL,
    positionX: question.positionX,
    positionY: question.positionY,
    tolerance: question.tolerance,
    distribution: results
      .reduce(
        (prev, playerResultItem) => {
          if (isPinAnswer(playerResultItem.answer)) {
            const answer = playerResultItem.answer.answer
            const distributionIndex = prev.findIndex(
              (item) => item.value === answer,
            )
            if (distributionIndex >= 0) {
              prev[distributionIndex].count += 1
            } else if (
              /^(0(\.\d+)?|1(\.0+)?)\s*,\s*(0(\.\d+)?|1(\.0+)?)$/.test(answer)
            ) {
              prev.push({
                value: answer,
                count: 1,
                correct: playerResultItem.correct,
              })
            }
          }
          return prev
        },
        correctAnswers.filter(isPinCorrectAnswer).map(({ value }) => ({
          value,
          count: 0,
          correct: true,
        })),
      )
      .sort((a, b) => {
        if (a.correct !== b.correct) {
          return a.correct ? -1 : 1
        }
        return b.count - a.count
      }),
  }
}

/**
 * Creates the answer distribution for a Puzzle question result event.
 *
 * Aggregates submitted arrays by comparing their ordered values using `arraysEqual`.
 * Only array answers are counted. The distribution is seeded with the correct value so it
 * appears even when no player submitted it.
 *
 * The resulting distribution is sorted by:
 * 1) correct answers first,
 * 2) higher count first.
 *
 * @param question - The Puzzle question definition, including the available `values`.
 * @param results - Per-player question result items to aggregate into counts.
 * @param correctAnswers - The correct answer entries for the question, used to seed the distribution.
 *
 * @returns A `GameEventQuestionResults` payload containing the Puzzle distribution and puzzle values.
 */
export function createPuzzleQuestionResultDistribution(
  question: QuestionPuzzleWithBase,
  results: QuestionResultTaskItem[],
  correctAnswers: QuestionResultTaskCorrectAnswer[],
): GameEventQuestionResults {
  return {
    type: QuestionType.Puzzle,
    values: question.values,
    distribution: results
      .reduce(
        (prev, playerResultItem) => {
          if (isPuzzleAnswer(playerResultItem.answer)) {
            const answer = playerResultItem.answer.answer
            if (answer && Array.isArray(answer)) {
              const distributionIndex = prev.findIndex(
                (item) =>
                  Array.isArray(item.value) &&
                  Array.isArray(answer) &&
                  arraysEqual(item.value, answer),
              )
              if (distributionIndex >= 0) {
                prev[distributionIndex].count += 1
              } else {
                prev.push({
                  value: answer,
                  count: 1,
                  correct: playerResultItem.correct,
                })
              }
            }
          }
          return prev
        },
        correctAnswers.filter(isPuzzleCorrectAnswer).map(({ value }) => ({
          value,
          count: 0,
          correct: true,
        })),
      )
      .sort((a, b) => {
        if (a.correct !== b.correct) {
          return a.correct ? -1 : 1
        }
        return b.count - a.count
      }),
  }
}
