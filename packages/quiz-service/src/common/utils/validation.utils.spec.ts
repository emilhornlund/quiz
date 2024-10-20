import { ValidationError } from '@nestjs/common'

import { ValidationConstraintError } from '../exceptions'

import { reduceNestedValidationErrors } from './validation.utils'

describe('reduceNestedValidationErrors', () => {
  it('should return an empty array when there are no errors', () => {
    const errors: ValidationError[] = []
    const result = reduceNestedValidationErrors(errors)
    expect(result).toEqual([])
  })

  it('should handle a single error with constraints', () => {
    const errors: ValidationError[] = [
      {
        property: 'id',
        constraints: {
          isString: 'id must be a string',
        },
      },
    ]

    const expected: ValidationConstraintError[] = [
      {
        property: 'id',
        constraints: {
          isString: 'id must be a string',
        },
      },
    ]

    const result = reduceNestedValidationErrors(errors)
    expect(result).toEqual(expected)
  })

  it('should handle nested errors with constraints', () => {
    const errors: ValidationError[] = [
      {
        property: 'user',
        children: [
          {
            property: 'username',
            constraints: {
              isString: 'username must be a string',
            },
          },
          {
            property: 'email',
            constraints: {
              isEmail: 'email must be a valid email',
            },
          },
        ],
      },
    ]

    const expected: ValidationConstraintError[] = [
      {
        property: 'user.username',
        constraints: {
          isString: 'username must be a string',
        },
      },
      {
        property: 'user.email',
        constraints: {
          isEmail: 'email must be a valid email',
        },
      },
    ]

    const result = reduceNestedValidationErrors(errors)
    expect(result).toEqual(expected)
  })

  it('should handle deeply nested errors', () => {
    const errors: ValidationError[] = [
      {
        property: 'user',
        children: [
          {
            property: 'profile',
            children: [
              {
                property: 'name',
                constraints: {
                  isString: 'name must be a string',
                },
              },
            ],
          },
        ],
      },
    ]

    const expected: ValidationConstraintError[] = [
      {
        property: 'user.profile.name',
        constraints: {
          isString: 'name must be a string',
        },
      },
    ]

    const result = reduceNestedValidationErrors(errors)
    expect(result).toEqual(expected)
  })

  it('should handle multiple root errors', () => {
    const errors: ValidationError[] = [
      {
        property: 'id',
        constraints: {
          isString: 'id must be a string',
        },
      },
      {
        property: 'name',
        constraints: {
          isNotEmpty: 'name should not be empty',
        },
      },
    ]

    const expected: ValidationConstraintError[] = [
      {
        property: 'id',
        constraints: {
          isString: 'id must be a string',
        },
      },
      {
        property: 'name',
        constraints: {
          isNotEmpty: 'name should not be empty',
        },
      },
    ]

    const result = reduceNestedValidationErrors(errors)
    expect(result).toEqual(expected)
  })

  it('should skip errors without constraints', () => {
    const errors: ValidationError[] = [
      {
        property: 'user',
        children: [
          {
            property: 'profile',
            children: [
              {
                property: 'name',
              },
            ],
          },
        ],
      },
    ]

    const result = reduceNestedValidationErrors(errors)
    expect(result).toEqual([]) // Since no constraints are present
  })

  it('should handle errors with both constraints and children', () => {
    const errors: ValidationError[] = [
      {
        property: 'user',
        constraints: {
          isNotEmpty: 'user should not be empty',
        },
        children: [
          {
            property: 'profile',
            constraints: {
              isNotEmpty: 'profile should not be empty',
            },
          },
        ],
      },
    ]

    const expected: ValidationConstraintError[] = [
      {
        property: 'user',
        constraints: {
          isNotEmpty: 'user should not be empty',
        },
      },
      {
        property: 'user.profile',
        constraints: {
          isNotEmpty: 'profile should not be empty',
        },
      },
    ]

    const result = reduceNestedValidationErrors(errors)
    expect(result).toEqual(expected)
  })
})
