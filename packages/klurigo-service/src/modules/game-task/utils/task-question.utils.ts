import { QuestionType, shuffleDifferent } from '@klurigo/common'
import { v4 as uuidv4 } from 'uuid'

import {
  GameDocument,
  QuestionTaskMetadata,
  QuestionTaskWithBase,
  TaskType,
} from '../../game-core/repositories/models/schemas'
import { QuestionDao } from '../../quiz-core/repositories/models/schemas'
import {
  isMultiChoiceQuestion,
  isPinQuestion,
  isPuzzleQuestion,
  isRangeQuestion,
  isTrueFalseQuestion,
  isTypeAnswerQuestion,
} from '../../quiz-core/utils'

/**
 * Constructs a new question task based on the provided game document.
 *
 * @param gameDocument - The current game document.
 *
 * @returns A new question task object.
 */
export function buildQuestionTask(
  gameDocument: GameDocument,
): QuestionTaskWithBase {
  return {
    _id: uuidv4(),
    type: TaskType.Question,
    status: 'pending',
    metadata: buildQuestionTaskMetadata(
      gameDocument.questions[gameDocument.nextQuestion],
    ),
    questionIndex: gameDocument.nextQuestion,
    answers: [],
    created: new Date(),
  }
}

/**
 * Constructs new a metadata object for a new question task based on the provided question.
 *
 * @param question - The next question.
 *
 * @returns A new question metadata object.
 */
function buildQuestionTaskMetadata(
  question: QuestionDao,
): QuestionTaskMetadata {
  if (isMultiChoiceQuestion(question)) {
    return { type: QuestionType.MultiChoice }
  }
  if (isRangeQuestion(question)) {
    return { type: QuestionType.Range }
  }
  if (isTrueFalseQuestion(question)) {
    return { type: QuestionType.TrueFalse }
  }
  if (isTypeAnswerQuestion(question)) {
    return { type: QuestionType.TypeAnswer }
  }
  if (isPinQuestion(question)) {
    return { type: QuestionType.Pin }
  }
  if (isPuzzleQuestion(question)) {
    const randomizedValues = shuffleDifferent(question.values)
    return { type: QuestionType.Puzzle, randomizedValues }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  throw new Error(`Unsupported question type '${(question as any).type}'`)
}
