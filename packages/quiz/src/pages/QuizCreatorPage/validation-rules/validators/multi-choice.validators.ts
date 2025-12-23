import { CustomValidator } from '../../../../validation'

/**
 * Minimal shape for option objects that can carry correctness metadata.
 */
type HasCorrectOption = { correct: boolean }

/**
 * Creates a validator that requires at least one option to be marked as correct.
 *
 * Intended for MultiChoice options validation.
 *
 * Notes:
 * - The validator reads the options array from the DTO to support cross-field validation.
 * - Missing options are treated as an empty list.
 */
export const mustHaveAtLeastOneCorrectOption =
  <TDto extends object>(
    getOptions: (dto: TDto) => readonly HasCorrectOption[] | undefined,
    message: string,
  ): CustomValidator<unknown, TDto> =>
  ({ dto }) => {
    const options = getOptions(dto) ?? []
    const hasCorrect = options.some((o) => o?.correct === true)
    return hasCorrect ? null : message
  }
