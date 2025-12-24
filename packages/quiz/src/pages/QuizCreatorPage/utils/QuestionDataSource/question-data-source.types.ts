import type { QuestionDto } from '@quiz/common'

import type { ValidationResult } from '../../../../validation'

/**
 * Editable question model used by the quiz creator UI.
 *
 * Represents an in-progress question that may be incomplete while the user is
 * editing. This intentionally allows missing fields until validation rules are
 * satisfied.
 */
export type QuizQuestionModel = Partial<QuestionDto>

/**
 * Validation result for a quiz question.
 *
 * Represents the outcome of validating the current question state. Errors are
 * exposed using path-based keys suitable for mapping to form controls.
 */
export type QuizQuestionValidationResult = ValidationResult<QuestionDto>

/**
 * Utility type that extracts the union of keys from a union type.
 *
 * For a union `A | B`, this resolves to `keyof A | keyof B`, which enables
 * type-safe field updates across discriminated question variants.
 */
type KeysOfUnion<T> = T extends unknown ? keyof T : never

/**
 * Utility type that resolves the value type for a given key across a union type.
 *
 * For union types where a key is not present on all members, the resulting type
 * only includes the members that actually contain the key.
 */
type ValueForKey<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? T[K]
    : never
  : never

/**
 * Function for updating a single field on a question model in a type-safe way.
 *
 * The key may refer to any property present on any member of the question union
 * type, and the value type is derived from the provided key.
 *
 * Passing `undefined` clears the value, which is useful for optional fields or
 * for resetting invalid state during editing.
 */
export type QuizQuestionModelFieldChangeFunction<T extends object> = <
  K extends KeysOfUnion<T>,
>(
  key: K,
  value?: ValueForKey<T, K>,
) => void
