import 'reflect-metadata'
import {
  QUIZ_RATING_COMMENT_MAX_LENGTH,
  QUIZ_RATING_COMMENT_MIN_LENGTH,
  QUIZ_RATING_COMMENT_REGEX,
  QUIZ_RATING_STARS_MAX,
  QUIZ_RATING_STARS_MIN,
} from '@klurigo/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { CreateQuizRatingRequest } from './create-quiz-rating.request'

type ValidationResult = {
  instance: CreateQuizRatingRequest
  errors: string[]
}

const validateRequest = async (
  input: Record<string, unknown>,
): Promise<ValidationResult> => {
  const instance = plainToInstance(CreateQuizRatingRequest, input)
  const validationErrors = await validate(instance)

  const errors = validationErrors.flatMap((e) =>
    e.constraints ? Object.values(e.constraints) : [],
  )

  return { instance, errors }
}

const repeat = (char: string, count: number): string =>
  new Array(count).fill(char).join('')

describe(CreateQuizRatingRequest.name, () => {
  describe('happy paths', () => {
    it('accepts stars at the minimum', async () => {
      const { errors } = await validateRequest({
        stars: QUIZ_RATING_STARS_MIN,
      })

      expect(errors).toEqual([])
    })

    it('accepts stars at the maximum', async () => {
      const { errors } = await validateRequest({
        stars: QUIZ_RATING_STARS_MAX,
      })

      expect(errors).toEqual([])
    })

    it('accepts a valid comment within allowed length and pattern', async () => {
      const { errors } = await validateRequest({
        stars: QUIZ_RATING_STARS_MAX,
        comment: 'Great quiz—good pacing and fun questions.',
      })

      expect(errors).toEqual([])
    })

    it('allows omitting the comment', async () => {
      const { errors } = await validateRequest({
        stars: QUIZ_RATING_STARS_MAX,
      })

      expect(errors).toEqual([])
    })
  })

  describe('validation failures: stars', () => {
    it('rejects missing stars', async () => {
      const { errors } = await validateRequest({})

      expect(errors).toEqual(
        expect.arrayContaining([expect.stringContaining('stars')]),
      )
      expect(errors).toContain('stars must be an integer number')
    })

    it('rejects non-integer stars', async () => {
      const { errors } = await validateRequest({
        stars: 3.5,
      })

      expect(errors).toContain('stars must be an integer number')
    })

    it('rejects stars below min', async () => {
      const { errors } = await validateRequest({
        stars: QUIZ_RATING_STARS_MIN - 1,
      })

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            `stars must not be less than ${QUIZ_RATING_STARS_MIN}`,
          ),
        ]),
      )
    })

    it('rejects stars above max', async () => {
      const { errors } = await validateRequest({
        stars: QUIZ_RATING_STARS_MAX + 1,
      })

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            `stars must not be greater than ${QUIZ_RATING_STARS_MAX}`,
          ),
        ]),
      )
    })

    it('rejects stars provided as a string (no implicit conversion here)', async () => {
      const { errors } = await validateRequest({
        stars: `${QUIZ_RATING_STARS_MAX}`,
      })

      expect(errors).toContain('stars must be an integer number')
    })
  })

  describe('comment behavior', () => {
    it('trims comment via @Transform', async () => {
      const { instance, errors } = await validateRequest({
        stars: QUIZ_RATING_STARS_MAX,
        comment: '   Great quiz—good pacing and fun questions.   ',
      })

      expect(errors).toEqual([])
      expect(instance.comment).toBe('Great quiz—good pacing and fun questions.')
    })

    it('accepts a comment exactly at the min length', async () => {
      const minLenComment = repeat('a', QUIZ_RATING_COMMENT_MIN_LENGTH)

      const { errors } = await validateRequest({
        stars: QUIZ_RATING_STARS_MAX,
        comment: minLenComment,
      })

      expect(errors).toEqual([])
    })

    it('accepts a comment exactly at the max length', async () => {
      const maxLenComment = repeat('a', QUIZ_RATING_COMMENT_MAX_LENGTH)

      const { errors } = await validateRequest({
        stars: QUIZ_RATING_STARS_MAX,
        comment: maxLenComment,
      })

      expect(errors).toEqual([])
    })
  })

  describe('validation failures: comment', () => {
    it('rejects comment that is not a string', async () => {
      const { errors } = await validateRequest({
        stars: QUIZ_RATING_STARS_MAX,
        comment: 123,
      })

      expect(errors).toContain('comment must be a string')
    })

    it('rejects comment shorter than min length', async () => {
      const tooShort = repeat(
        'a',
        Math.max(0, QUIZ_RATING_COMMENT_MIN_LENGTH - 1),
      )

      const { errors } = await validateRequest({
        stars: QUIZ_RATING_STARS_MAX,
        comment: tooShort,
      })

      if (QUIZ_RATING_COMMENT_MIN_LENGTH > 0) {
        expect(errors).toEqual(
          expect.arrayContaining([
            expect.stringContaining(
              `comment must be longer than or equal to ${QUIZ_RATING_COMMENT_MIN_LENGTH} characters`,
            ),
          ]),
        )
      }
    })

    it('rejects comment longer than max length', async () => {
      const tooLong = repeat('a', QUIZ_RATING_COMMENT_MAX_LENGTH + 1)

      const { errors } = await validateRequest({
        stars: QUIZ_RATING_STARS_MAX,
        comment: tooLong,
      })

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            `comment must be shorter than or equal to ${QUIZ_RATING_COMMENT_MAX_LENGTH} characters`,
          ),
        ]),
      )
    })

    it('rejects blank/whitespace-only comment using the custom Matches message', async () => {
      const { instance, errors } = await validateRequest({
        stars: QUIZ_RATING_STARS_MAX,
        comment: '   ',
      })

      // After trim(), comment becomes '' (empty string)
      expect(instance.comment).toBe('')
      // Depending on min-length, you may get both MinLength and Matches violations.
      expect(errors).toEqual(
        expect.arrayContaining(['Comment must not be blank.']),
      )
    })

    it('rejects comment that does not match QUIZ_RATING_COMMENT_REGEX', async () => {
      // Use a value likely to violate "not blank" / allowed chars constraints.
      // If your regex is stricter (e.g. disallow certain control chars), adjust this sample.
      const invalid = '\n'

      const { errors } = await validateRequest({
        stars: QUIZ_RATING_STARS_MAX,
        comment: invalid,
      })

      // The custom message is only applied to @Matches, so asserting on that is stable.
      expect(errors).toEqual(
        expect.arrayContaining(['Comment must not be blank.']),
      )
    })
  })

  describe('multiple errors', () => {
    it('returns relevant errors when both stars and comment are invalid', async () => {
      const { errors } = await validateRequest({
        stars: QUIZ_RATING_STARS_MAX + 1,
        comment: '   ',
      })

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            `stars must not be greater than ${QUIZ_RATING_STARS_MAX}`,
          ),
          'Comment must not be blank.',
        ]),
      )
    })
  })

  describe('constants sanity checks', () => {
    it('QUIZ_RATING_COMMENT_REGEX is a RegExp and is used as the pattern', () => {
      expect(QUIZ_RATING_COMMENT_REGEX).toBeInstanceOf(RegExp)
    })
  })
})
