import {
  BSONDocument,
  extractValue,
  extractValueOrThrow,
  toDate,
} from '../utils'

/**
 * Transforms a document from the `quiz_ratings` collection into a `QuizRating` document format.
 *
 * @param document - A single document from the original `quiz_ratings` collection.
 * @returns The transformed `QuizRating`-format document.
 */
export function transformQuizRatingDocument(
  document: BSONDocument,
): BSONDocument {
  return {
    _id: extractValueOrThrow<string>(document, {}, '_id'),
    __v: 0,
    quizId: extractValueOrThrow<string>(document, {}, 'quizId'),
    author: extractValueOrThrow<string>(document, {}, 'author'),
    stars: extractValueOrThrow<number>(document, {}, 'stars'),
    comment: extractValue<number>(document, {}, 'comment'),
    updated: toDate(extractValueOrThrow<string>(document, {}, 'updated')),
    created: toDate(extractValueOrThrow<string>(document, {}, 'created')),
  }
}
