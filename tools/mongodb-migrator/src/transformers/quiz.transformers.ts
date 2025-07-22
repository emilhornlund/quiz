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
    category: extractValue<string>(document, {}, 'category') || 'OTHER',
    imageCoverURL: extractValue<string>(document, {}, 'imageCoverURL'),
    languageCode: extractValueOrThrow<string>(document, {}, 'languageCode'),
    questions: buildQuizQuestions(document),
    owner: extractValueOrThrow<string>(document, {}, 'owner'),
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
          step:
            extractValue<number>(question, {}, 'step') ||
            calculateRangeStep(min, max),
          margin: extractValue<string>(question, {}, 'margin') || 'MEDIUM',
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
          options: extractValue<string[]>(question, {}, 'options') || [
            extractValueOrThrow<string>(question, {}, 'correct').toLowerCase(),
          ],
        }
      }
      return {
        type,
        text: extractValueOrThrow<string>(question, {}, 'text', 'question'),
        media: ((media) => {
          if (media) {
            return {
              type: extractValueOrThrow<string>(media, {}, 'type'),
              url: extractValueOrThrow<string>(media, {}, 'url'),
            }
          }
          return null
        })(extractValue<BSONDocument>(question, {}, 'media')),
        points: extractValueOrThrow<number>(question, {}, 'points'),
        duration: extractValueOrThrow<number>(question, {}, 'duration'),
        ...additional,
      }
    },
  )
}

/**
 * Calculates an appropriate step value for a slider given the range between `min` and `max`.
 * The step is dynamically adjusted to ensure it is user-friendly and practical for interaction.
 *
 * @param {number} min - The minimum value of the slider range.
 * @param {number} max - The maximum value of the slider range.
 * @param {number} [targetSteps=50] - The approximate number of steps desired for the slider.
 *                                    Defaults to 50 if not provided.
 * @returns {number} - The calculated step size for the slider.
 */
function calculateRangeStep(
  min: number,
  max: number,
  targetSteps: number = 50,
): number {
  const range = max - min

  if (range <= 0) {
    return 0
  }

  const rawStep = range / targetSteps

  const minimumStep = 1

  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))

  const refinedStep =
    rawStep <= magnitude
      ? magnitude
      : Math.ceil(rawStep / magnitude) * magnitude

  return Math.max(refinedStep, minimumStep)
}
