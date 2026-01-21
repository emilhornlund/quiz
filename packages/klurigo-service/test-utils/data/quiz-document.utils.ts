import { v4 as uuidv4 } from 'uuid'

import { QuizRating } from '../../src/modules/quiz-core/repositories/models/schemas'
import { User } from '../../src/modules/user/repositories'

export function buildMockQuizRating(
  quizRating?: Partial<QuizRating>,
): QuizRating {
  const now = new Date()
  return {
    _id: uuidv4(),
    quizId: uuidv4(),
    author: { _id: uuidv4() } as User,
    stars: 5,
    comment: undefined,
    created: now,
    updated: now,
    ...(quizRating ?? {}),
  }
}
