import { QuizVisibility } from '@klurigo/common'

import { Quiz } from '../../repositories/models/schemas'

import {
  isDiscoveryEligible,
  MIN_COVER_REQUIRED,
  MIN_DESCRIPTION_LENGTH,
  MIN_QUESTION_COUNT,
} from './discovery-eligibility.utils'

const makeQuiz = (overrides: Partial<Quiz> = {}): Quiz =>
  ({
    visibility: QuizVisibility.Public,
    imageCoverURL: 'https://example.com/cover.jpg',
    description: 'A quiz with a sufficiently long description',
    questions: Array.from({ length: 10 }, (_, i) => ({ _id: `q${i}` })),
    ...overrides,
  }) as unknown as Quiz

describe('Discovery Eligibility Utils', () => {
  describe('constants', () => {
    it('MIN_COVER_REQUIRED should be true', () => {
      expect(MIN_COVER_REQUIRED).toBe(true)
    })

    it('MIN_DESCRIPTION_LENGTH should be 20', () => {
      expect(MIN_DESCRIPTION_LENGTH).toBe(20)
    })

    it('MIN_QUESTION_COUNT should be 10', () => {
      expect(MIN_QUESTION_COUNT).toBe(10)
    })
  })

  describe('isDiscoveryEligible', () => {
    it('should return true for a fully eligible quiz', () => {
      expect(isDiscoveryEligible(makeQuiz())).toBe(true)
    })

    describe('visibility', () => {
      it('should return false when visibility is not Public', () => {
        expect(
          isDiscoveryEligible(makeQuiz({ visibility: QuizVisibility.Private })),
        ).toBe(false)
      })

      it('should return true when visibility is Public', () => {
        expect(
          isDiscoveryEligible(makeQuiz({ visibility: QuizVisibility.Public })),
        ).toBe(true)
      })
    })

    describe('cover image', () => {
      it('should return false when imageCoverURL is absent', () => {
        expect(
          isDiscoveryEligible(makeQuiz({ imageCoverURL: undefined })),
        ).toBe(false)
      })

      it('should return false when imageCoverURL is an empty string', () => {
        expect(isDiscoveryEligible(makeQuiz({ imageCoverURL: '' }))).toBe(false)
      })

      it('should return false when imageCoverURL is a whitespace-only string', () => {
        expect(isDiscoveryEligible(makeQuiz({ imageCoverURL: '   ' }))).toBe(
          false,
        )
      })

      it('should return true when imageCoverURL is a non-empty string', () => {
        expect(
          isDiscoveryEligible(
            makeQuiz({ imageCoverURL: 'https://example.com/img.jpg' }),
          ),
        ).toBe(true)
      })
    })

    describe('description length', () => {
      it('should return false when description is absent', () => {
        expect(isDiscoveryEligible(makeQuiz({ description: undefined }))).toBe(
          false,
        )
      })

      it('should return false when description is empty', () => {
        expect(isDiscoveryEligible(makeQuiz({ description: '' }))).toBe(false)
      })

      it('should return false when description is whitespace-only', () => {
        expect(isDiscoveryEligible(makeQuiz({ description: '     ' }))).toBe(
          false,
        )
      })

      it('should return false when description is shorter than MIN_DESCRIPTION_LENGTH', () => {
        // 19 chars — one short of the threshold
        expect(
          isDiscoveryEligible(makeQuiz({ description: 'A'.repeat(19) })),
        ).toBe(false)
      })

      it('should return false when trimmed description is shorter than MIN_DESCRIPTION_LENGTH', () => {
        // 19 meaningful chars padded with spaces — trimmed length is still 19
        expect(
          isDiscoveryEligible(
            makeQuiz({ description: '   ' + 'A'.repeat(19) + '   ' }),
          ),
        ).toBe(false)
      })

      it('should return true when description length equals MIN_DESCRIPTION_LENGTH', () => {
        expect(
          isDiscoveryEligible(makeQuiz({ description: 'A'.repeat(20) })),
        ).toBe(true)
      })

      it('should return true when trimmed description length equals MIN_DESCRIPTION_LENGTH', () => {
        // Surrounding whitespace must not be counted
        expect(
          isDiscoveryEligible(
            makeQuiz({ description: '   ' + 'A'.repeat(20) + '   ' }),
          ),
        ).toBe(true)
      })

      it('should return true when description length exceeds MIN_DESCRIPTION_LENGTH', () => {
        expect(
          isDiscoveryEligible(makeQuiz({ description: 'A'.repeat(50) })),
        ).toBe(true)
      })
    })

    describe('question count', () => {
      it('should return false when questions.length is 0', () => {
        expect(isDiscoveryEligible(makeQuiz({ questions: [] as any }))).toBe(
          false,
        )
      })

      it('should return false when questions.length is 9 (one below threshold)', () => {
        expect(
          isDiscoveryEligible(
            makeQuiz({
              questions: Array.from({ length: 9 }, (_, i) => ({
                _id: `q${i}`,
              })) as any,
            }),
          ),
        ).toBe(false)
      })

      it('should return true when questions.length equals MIN_QUESTION_COUNT (10)', () => {
        expect(
          isDiscoveryEligible(
            makeQuiz({
              questions: Array.from({ length: 10 }, (_, i) => ({
                _id: `q${i}`,
              })) as any,
            }),
          ),
        ).toBe(true)
      })

      it('should return true when questions.length exceeds MIN_QUESTION_COUNT', () => {
        expect(
          isDiscoveryEligible(
            makeQuiz({
              questions: Array.from({ length: 20 }, (_, i) => ({
                _id: `q${i}`,
              })) as any,
            }),
          ),
        ).toBe(true)
      })
    })
  })
})
