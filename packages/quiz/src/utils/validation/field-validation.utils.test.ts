import { describe, expect, it, vi } from 'vitest'

import {
  isCallbackValid,
  isValidNumber,
  isValidString,
} from './field-validation.utils.ts'

describe('isCallbackValid', () => {
  it('returns [true, undefined] when no callback is provided', () => {
    expect(isCallbackValid('anything')).toEqual([true, undefined])
    expect(isCallbackValid(undefined)).toEqual([true, undefined])
  })

  it('returns [true, undefined] when value is undefined (callback should not be called)', () => {
    const cb = vi.fn().mockReturnValue(false)
    const res = isCallbackValid(undefined, cb)
    expect(res).toEqual([true, undefined])
    expect(cb).not.toHaveBeenCalled()
  })

  it('returns [true, undefined] when callback returns true', () => {
    const cb = vi.fn().mockReturnValue(true)
    expect(isCallbackValid('x', cb)).toEqual([true, undefined])
    expect(cb).toHaveBeenCalledWith('x')
  })

  it('returns [false, undefined] when callback returns false', () => {
    const cb = vi.fn().mockReturnValue(false)
    expect(isCallbackValid(123, cb)).toEqual([false, undefined])
    expect(cb).toHaveBeenCalledWith(123)
  })

  it('returns [false, message] when callback returns a string', () => {
    const cb = vi.fn().mockReturnValue('Nope')
    expect(isCallbackValid({ a: 1 }, cb)).toEqual([false, 'Nope'])
    expect(cb).toHaveBeenCalledWith({ a: 1 })
  })
})

describe('isValidString', () => {
  it('skips validation when disabled', () => {
    expect(
      isValidString({ disabled: true, required: true, value: '' }),
    ).toEqual([true, undefined])
  })

  it('fails when value is not a string (default required message)', () => {
    expect(isValidString({ value: undefined })).toEqual([
      false,
      'This field is required',
    ])
    // @ts-expect-error intentional non-string
    expect(isValidString({ value: 123 })).toEqual([
      false,
      'This field is required',
    ])
  })

  it('fails when required (boolean) and empty string', () => {
    expect(isValidString({ value: '', required: true })).toEqual([
      false,
      'This field is required',
    ])
  })

  it('fails with custom required message when required is a string', () => {
    expect(
      isValidString({ value: '', required: 'Custom required message' }),
    ).toEqual([false, 'Custom required message'])
  })

  it('passes when not required and value is empty string? (implementation returns required error for non-string or empty with required only)', () => {
    expect(isValidString({ value: '' })).toEqual([true, undefined])
  })

  describe('length boundaries', () => {
    it('fails when shorter than minLength', () => {
      expect(isValidString({ value: 'abc', minLength: 4 })).toEqual([
        false,
        'Minimum length must be greater than 4',
      ])
    })

    it('passes when equal to minLength', () => {
      expect(isValidString({ value: 'abcd', minLength: 4 })).toEqual([
        true,
        undefined,
      ])
    })

    it('fails when longer than maxLength', () => {
      expect(isValidString({ value: 'abcdef', maxLength: 5 })).toEqual([
        false,
        'Maximum length must be less than 5',
      ])
    })

    it('passes when equal to maxLength', () => {
      expect(isValidString({ value: 'abcde', maxLength: 5 })).toEqual([
        true,
        undefined,
      ])
    })
  })

  describe('regex validation', () => {
    const lettersOnly = /^[a-z]+$/

    it('passes when value matches RegExp', () => {
      expect(isValidString({ value: 'abc', regex: lettersOnly })).toEqual([
        true,
        undefined,
      ])
    })

    it("fails with default message when value doesn't match RegExp", () => {
      expect(isValidString({ value: 'abc123', regex: lettersOnly })).toEqual([
        false,
        "Can't contain illegal character",
      ])
    })

    it('fails with custom message when regex is provided as object', () => {
      expect(
        isValidString({
          value: 'abc123',
          regex: { value: lettersOnly, message: 'Only lowercase letters' },
        }),
      ).toEqual([false, 'Only lowercase letters'])
    })
  })

  it('passes for a typical valid case', () => {
    expect(
      isValidString({
        value: 'Klurigo',
        required: true,
        minLength: 3,
        maxLength: 20,
        regex: /^[A-Za-z]+$/,
      }),
    ).toEqual([true, undefined])
  })
})

describe('isValidNumber', () => {
  it('skips validation when disabled', () => {
    expect(isValidNumber({ disabled: true })).toEqual([true, undefined])
    expect(isValidNumber({ disabled: true, required: true })).toEqual([
      true,
      undefined,
    ])
  })

  it('fails when required and value is undefined (default message)', () => {
    expect(isValidNumber({ required: true })).toEqual([
      false,
      'This field is required',
    ])
  })

  it('fails when required and undefined with custom message', () => {
    expect(isValidNumber({ required: 'Number is required' })).toEqual([
      false,
      'Number is required',
    ])
  })

  it('fails when value is not a number', () => {
    // @ts-expect-error intentional wrong type
    expect(isValidNumber({ value: '123' })).toEqual([
      false,
      'Must be a valid number',
    ])
    expect(isValidNumber({ value: Number.NaN })).toEqual([
      false,
      'Must be a valid number',
    ])
  })

  it('passes when value is a valid number including 0', () => {
    expect(isValidNumber({ value: 0 })).toEqual([true, undefined])
    expect(isValidNumber({ value: -10 })).toEqual([true, undefined])
    expect(isValidNumber({ value: 42.5 })).toEqual([true, undefined])
  })

  describe('min/max boundaries', () => {
    it('fails when less than min', () => {
      expect(isValidNumber({ value: 4, min: 5 })).toEqual([
        false,
        'Cannot be less than 5',
      ])
    })

    it('passes when equal to min', () => {
      expect(isValidNumber({ value: 5, min: 5 })).toEqual([true, undefined])
    })

    it('fails when greater than max', () => {
      expect(isValidNumber({ value: 11, max: 10 })).toEqual([
        false,
        'Cannot be greater than 10',
      ])
    })

    it('passes when equal to max', () => {
      expect(isValidNumber({ value: 10, max: 10 })).toEqual([true, undefined])
    })

    it('passes when within range', () => {
      expect(isValidNumber({ value: 7, min: 5, max: 10 })).toEqual([
        true,
        undefined,
      ])
    })
  })

  it('required should not fail for value 0', () => {
    expect(isValidNumber({ value: 0, required: true })).toEqual([
      true,
      undefined,
    ])
  })
})
