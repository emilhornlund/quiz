import { ArgumentMetadata } from '@nestjs/common'
import { validate } from 'class-validator'

import { ValidationException } from '../exceptions'

import { ValidationPipe } from './validation.pipe'

jest.mock('class-validator')

class TestDto {
  property: string
}

describe('ValidationPipe', () => {
  let pipe: ValidationPipe

  beforeEach(() => {
    pipe = new ValidationPipe()
  })

  it('should return the value if no metatype is provided', async () => {
    const value = { property: 'value' }
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: undefined,
      data: '',
    }

    const result = await pipe.transform(value, metadata)

    expect(result).toBe(value)
  })

  it('should return the value if metatype is a native type', async () => {
    const value = { property: 'value' }
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: String,
      data: '',
    }

    const result = await pipe.transform(value, metadata)

    expect(result).toBe(value)
  })

  it('should throw ValidationException if validation fails', async () => {
    const value = { property: 'value' }
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: TestDto,
      data: '',
    }
    const validationErrors = [
      {
        property: 'property',
        constraints: { isString: 'property must be a string' },
      },
    ]
    ;(validate as jest.Mock).mockResolvedValue(validationErrors)

    await expect(pipe.transform(value, metadata)).rejects.toThrow(
      ValidationException,
    )

    try {
      await pipe.transform(value, metadata)
    } catch (e) {
      const exception = e as ValidationException
      expect(exception).toBeInstanceOf(ValidationException)
      expect(exception.validationErrors).toEqual(validationErrors)
    }
  })

  it('should return the value if validation succeeds', async () => {
    const value = { property: 'value' }
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: TestDto,
      data: '',
    }
    ;(validate as jest.Mock).mockResolvedValue([])

    const result = await pipe.transform(value, metadata)

    expect(result).toBe(value)
  })
})
