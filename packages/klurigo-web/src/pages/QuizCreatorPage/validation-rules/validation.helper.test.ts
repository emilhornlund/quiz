import { describe, expect, it } from 'vitest'

import type { ValidationResult } from '../../../validation'

import { getValidationErrorMessage } from './validation.helpers'

type TestDto = {
  title: string
  media?: { url: string }
}

const makeValidationResult = (
  errors: Array<{ path: string; message?: string }>,
): ValidationResult<TestDto> =>
  ({
    valid: errors.length === 0,
    errors,
    fields: {},
    paths: {},
  }) as unknown as ValidationResult<TestDto>

describe('getValidationErrorMessage', () => {
  it('returns undefined when no error exists for the given path', () => {
    const validation = makeValidationResult([
      { path: 'title', message: 'Title is required.' },
    ])

    expect(getValidationErrorMessage(validation, 'media.url')).toBeUndefined()
  })

  it('returns the error message when an error exists for the given path', () => {
    const validation = makeValidationResult([
      { path: 'media.url', message: 'Invalid URL.' },
    ])

    expect(getValidationErrorMessage(validation, 'media.url')).toBe(
      'Invalid URL.',
    )
  })

  it('returns the first matching error message when multiple errors exist for the same path', () => {
    const validation = makeValidationResult([
      { path: 'title', message: 'Title is required.' },
      { path: 'title', message: 'Title is too short.' },
    ])

    expect(getValidationErrorMessage(validation, 'title')).toBe(
      'Title is required.',
    )
  })

  it('matches paths exactly (does not treat prefixes as matches)', () => {
    const validation = makeValidationResult([
      { path: 'media.url', message: 'Invalid URL.' },
    ])

    expect(getValidationErrorMessage(validation, 'media')).toBeUndefined()
  })
})
