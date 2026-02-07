import {
  BSONDocument,
  extractValue,
  extractValueOrThrow,
  toDate,
} from '../utils'

/**
 * Transforms a document from the `quizzes` collection into a `quiz` document format.
 *
 * @param document - A single document from the original `quizzes` collection.
 * @returns The transformed `quiz`-format document.
 */
export function transformQuizDocument(document: BSONDocument): BSONDocument {
  return {
    _id: extractValueOrThrow<string>(document, {}, '_id'),
    __v: 0,
    title: extractValueOrThrow<string>(document, {}, 'title'),
    description: extractValue<string>(document, {}, 'description'),
    mode: extractValueOrThrow<string>(document, {}, 'mode'),
    visibility: extractValueOrThrow<string>(document, {}, 'visibility'),
    category: extractValueOrThrow<string>(document, {}, 'category'),
    imageCoverURL: extractValue<string>(document, {}, 'imageCoverURL'),
    languageCode: extractValueOrThrow<string>(document, {}, 'languageCode'),
    questions: buildQuizQuestions(document),
    owner: extractValueOrThrow<string>(document, {}, 'owner'),
    gameplaySummary: {
      count: extractValueOrThrow<number>(document, {}, 'gameplaySummary.count'),
      totalPlayerCount: extractValueOrThrow<number>(
        document,
        {},
        'gameplaySummary.totalPlayerCount',
      ),
      totalClassicCorrectCount: extractValueOrThrow<number>(
        document,
        {},
        'gameplaySummary.totalClassicCorrectCount',
      ),
      totalClassicIncorrectCount: extractValueOrThrow<number>(
        document,
        {},
        'gameplaySummary.totalClassicIncorrectCount',
      ),
      totalClassicUnansweredCount: extractValueOrThrow<number>(
        document,
        {},
        'gameplaySummary.totalClassicUnansweredCount',
      ),
      totalZeroToOneHundredPrecisionSum: extractValueOrThrow<number>(
        document,
        {},
        'gameplaySummary.totalZeroToOneHundredPrecisionSum',
      ),
      totalZeroToOneHundredAnsweredCount: extractValueOrThrow<number>(
        document,
        {},
        'gameplaySummary.totalZeroToOneHundredAnsweredCount',
      ),
      totalZeroToOneHundredUnansweredCount: extractValueOrThrow<number>(
        document,
        {},
        'gameplaySummary.totalZeroToOneHundredUnansweredCount',
      ),
      lastPlayedAt: toDate(
        extractValue<string>(document, {}, 'gameplaySummary.lastPlayedAt'),
      ),
      updated: toDate(
        extractValue<string>(document, {}, 'gameplaySummary.updated'),
      ),
    },
    ratingSummary: {
      count: extractValueOrThrow<number>(document, {}, 'ratingSummary.count'),
      avg: extractValueOrThrow<number>(document, {}, 'ratingSummary.avg'),
      stars: {
        '1': extractValueOrThrow<number>(document, {}, 'ratingSummary.stars.1'),
        '2': extractValueOrThrow<number>(document, {}, 'ratingSummary.stars.2'),
        '3': extractValueOrThrow<number>(document, {}, 'ratingSummary.stars.3'),
        '4': extractValueOrThrow<number>(document, {}, 'ratingSummary.stars.4'),
        '5': extractValueOrThrow<number>(document, {}, 'ratingSummary.stars.5'),
      },
      commentCount: extractValueOrThrow<number>(
        document,
        {},
        'ratingSummary.commentCount',
      ),
      updated: toDate(
        extractValue<string>(document, {}, 'ratingSummary.updated'),
      ),
    },
    updated: toDate(extractValueOrThrow<string>(document, {}, 'updated')),
    created: toDate(extractValueOrThrow<string>(document, {}, 'created')),
  }
}

/**
 * Extracts and normalizes the `questions` array from a quiz document.
 *
 * @param document - A single document from the original `quizzes` collection, containing a `questions` field.
 * @returns An array of transformed question objects conforming to our target quiz schema.
 */
export function buildQuizQuestions(
  document: BSONDocument,
): Array<BSONDocument> {
  return extractValueOrThrow<BSONDocument[]>(document, {}, 'questions').map(
    (question) => {
      const type = extractValueOrThrow<string>(question, {}, 'type')
      let additional: BSONDocument = {}
      if (type === 'MULTI_CHOICE') {
        additional = {
          options: ((options) =>
            options.map((option) => ({
              value: extractValueOrThrow<string>(option, {}, 'value'),
              correct: extractValueOrThrow<boolean>(option, {}, 'correct'),
            })))(extractValueOrThrow<BSONDocument[]>(question, {}, 'options')),
        }
      }
      if (type === 'RANGE') {
        const min = extractValueOrThrow<number>(question, {}, 'min')
        const max = extractValueOrThrow<number>(question, {}, 'max')

        additional = {
          min,
          max,
          step: extractValueOrThrow<number>(question, {}, 'step'),
          margin: extractValueOrThrow<string>(question, {}, 'margin'),
          correct: extractValueOrThrow<number>(question, {}, 'correct'),
        }
      }
      if (type === 'TRUE_FALSE') {
        additional = {
          correct: extractValueOrThrow<boolean>(question, {}, 'correct'),
        }
      }
      if (type === 'TYPE_ANSWER') {
        additional = {
          options: extractValueOrThrow<string[]>(question, {}, 'options'),
        }
      }
      if (type === 'PIN') {
        additional = {
          imageURL: extractValueOrThrow<string>(question, {}, 'imageURL'),
          positionX: extractValueOrThrow<string>(question, {}, 'positionX'),
          positionY: extractValueOrThrow<string>(question, {}, 'positionY'),
          tolerance: extractValueOrThrow<string>(question, {}, 'tolerance'),
        }
      }
      if (type === 'PUZZLE') {
        additional = {
          values: extractValueOrThrow<string[]>(question, {}, 'values'),
        }
      }
      return {
        type,
        text: extractValueOrThrow<string>(question, {}, 'text', 'question'),
        media: ((media) => {
          if (media && type !== 'PIN') {
            const mediaType = extractValueOrThrow<string>(media, {}, 'type')
            return {
              type: mediaType,
              url: extractValueOrThrow<string>(media, {}, 'url'),
              ...(mediaType === 'IMAGE'
                ? { effect: extractValue<string>(media, {}, 'effect') }
                : {}),
            }
          }
          return null
        })(extractValue<BSONDocument>(question, {}, 'media')),
        points: extractValueOrThrow<number>(question, {}, 'points'),
        duration: extractValueOrThrow<number>(question, {}, 'duration'),
        info: extractValue<number>(question, {}, 'info'),
        ...additional,
      }
    },
  )
}
