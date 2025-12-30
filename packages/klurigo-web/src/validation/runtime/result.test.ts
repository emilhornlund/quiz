import { describe, expect, it } from 'vitest'

import type { ValidationError } from '../model'

import { buildValidationResult } from './result'

describe('buildValidationResult', () => {
  it('should return valid result with empty maps when there are no errors', () => {
    const res = buildValidationResult<object>([])

    expect(res).toEqual({
      valid: true,
      errors: [],
      fields: {},
      paths: {},
    })
  })

  it('should map two errors with the same path to a single paths entry (object key)', () => {
    const path = 'question'

    const errors: ValidationError[] = [
      { path, code: 'minLength', message: 'Too short.' },
      { path, code: 'regex', message: 'Invalid format.' },
    ]

    const res = buildValidationResult<object>(errors)

    expect(res.valid).toBe(false)
    expect(res.errors).toEqual(errors)

    expect(res.paths).toEqual({ [path]: false })
    expect(Object.keys(res.paths)).toHaveLength(1)
  })

  it('should map nested array/object paths to their top-level field in fields', () => {
    const errors: ValidationError[] = [
      { path: 'options[0].value', code: 'required', message: 'Required.' },
    ]

    const res = buildValidationResult<{ options?: boolean }>(errors)

    expect(res.valid).toBe(false)
    expect(res.paths).toEqual({ 'options[0].value': false })
    expect(res.fields).toEqual({ options: false })
  })

  it("should map '$' path to fields['$'] === false (sentinel for root-level errors)", () => {
    const errors: ValidationError[] = [
      { path: '$', code: 'type', message: 'Expected an object.' },
    ]

    const res = buildValidationResult<Record<string, unknown>>(errors)

    expect(res.valid).toBe(false)
    expect(res.paths).toEqual({ $: false })
    expect(res.fields).toEqual({ $: false })
  })
})
