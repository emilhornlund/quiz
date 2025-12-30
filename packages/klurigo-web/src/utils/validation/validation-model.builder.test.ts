import { describe, expect, it } from 'vitest'

import { buildValidationModel } from './validation-model.builder'
import type { ValidationRules } from './validation-model.builder.types'

type TestModel = {
  title?: string
  description?: string
  category?: 'A' | 'B'
  count?: number
}

const rules: ValidationRules<TestModel> = {
  title: { required: true, minLength: 3, maxLength: 10, regex: /^[a-z]+$/i },
  description: { maxLength: 5 },
  category: { required: true },
  count: { required: true },
}

describe('buildValidationModel', () => {
  it('treats optional empty string fields as valid (required-only path)', () => {
    const result = buildValidationModel<TestModel>(
      {
        title: 'abc',
        description: undefined,
        category: 'A',
        count: 1,
      },
      rules,
    )

    expect(result.validation.description).toBe(true)
    expect(result.errors.description).toBeUndefined()
    expect(result.valid).toBe(true)
  })

  it('fails required string field when value is undefined (required-only path)', () => {
    const result = buildValidationModel<TestModel>(
      {
        title: undefined,
        category: 'A',
        count: 1,
      },
      rules,
    )

    expect(result.validation.title).toBe(false)
    expect(result.errors.title).toEqual(['title is required'])
    expect(result.valid).toBe(false)
  })

  it('fails required string field when value is whitespace (required-only path)', () => {
    const result = buildValidationModel<TestModel>(
      {
        title: '   ',
        category: 'A',
        count: 1,
      },
      rules,
    )

    expect(result.validation.title).toBe(false)
    expect(result.errors.title).toEqual(['title is required'])
    expect(result.valid).toBe(false)
  })

  it('fails required non-string field when value is undefined (required-only path)', () => {
    const result = buildValidationModel<TestModel>(
      {
        title: 'abc',
        category: undefined,
        count: 1,
      },
      rules,
    )

    expect(result.validation.category).toBe(false)
    expect(result.errors.category).toEqual(['category is required'])
    expect(result.valid).toBe(false)
  })

  it('validates string minLength when a string value is present (string path)', () => {
    const result = buildValidationModel<TestModel>(
      {
        title: 'ab',
        category: 'A',
        count: 1,
      },
      rules,
    )

    expect(result.validation.title).toBe(false)
    expect(result.errors.title).toEqual(['title must be at least 3 characters'])
  })

  it('validates string maxLength when a string value is present (string path)', () => {
    const result = buildValidationModel<TestModel>(
      {
        title: 'abcdefghijkl', // 12
        category: 'A',
        count: 1,
      },
      rules,
    )

    expect(result.validation.title).toBe(false)
    expect(result.errors.title).toEqual(['title must be at most 10 characters'])
  })

  it('validates string regex when a string value is present (string path)', () => {
    const result = buildValidationModel<TestModel>(
      {
        title: 'abc-123',
        category: 'A',
        count: 1,
      },
      rules,
    )

    expect(result.validation.title).toBe(false)
    expect(result.errors.title).toEqual(['title is not in the expected format'])
  })

  it('marks string field valid when all string rules pass (string path)', () => {
    const result = buildValidationModel<TestModel>(
      {
        title: 'Abc',
        category: 'A',
        count: 1,
      },
      rules,
    )

    expect(result.validation.title).toBe(true)
    expect(result.errors.title).toBeUndefined()
  })

  it('treats non-string present values as non-string validation (non-string path)', () => {
    const result = buildValidationModel<TestModel>(
      {
        title: 'Abc',
        category: 'A',
        count: 0,
      },
      rules,
    )

    expect(result.validation.count).toBe(true)
    expect(result.errors.count).toBeUndefined()
  })

  it('computes aggregated valid=false when any field is invalid', () => {
    const result = buildValidationModel<TestModel>(
      {
        title: 'ab', // invalid (minLength)
        category: 'A',
        count: 1,
      },
      rules,
    )

    expect(result.valid).toBe(false)
  })

  it('produces validation entries for all rule keys', () => {
    const result = buildValidationModel<TestModel>(
      {
        title: 'abc',
        description: 'hello',
        category: 'A',
        count: 1,
      },
      rules,
    )

    expect(Object.keys(result.validation).sort()).toEqual(
      ['category', 'count', 'description', 'title'].sort(),
    )
  })

  it('does not apply string rules when value is empty and not required (required-only path)', () => {
    const result = buildValidationModel<TestModel>(
      {
        title: 'abc',
        description: undefined, // maxLength exists in rules, but should not error when empty
        category: 'A',
        count: 1,
      },
      rules,
    )

    expect(result.validation.description).toBe(true)
    expect(result.errors.description).toBeUndefined()
    expect(result.valid).toBe(true)
  })

  it('treats empty rules as invalid and returns an empty validation model', () => {
    const emptyRules: ValidationRules<TestModel> =
      {} as ValidationRules<TestModel>

    const result = buildValidationModel<TestModel>(
      {
        title: 'abc',
        description: 'hello',
        category: 'A',
        count: 1,
      },
      emptyRules,
    )

    expect(result.validation).toEqual({})
    expect(result.errors).toEqual({})
    expect(result.valid).toBe(false)
  })
})
