import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'

import { ValidationException } from '../exceptions'

import { AllExceptionsFilter } from './all-exceptions.filter'

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter
  let httpAdapterHost: HttpAdapterHost
  let logger: Logger

  beforeEach(async () => {
    httpAdapterHost = {
      httpAdapter: {
        reply: jest.fn(),
      },
    } as unknown as HttpAdapterHost

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllExceptionsFilter,
        { provide: HttpAdapterHost, useValue: httpAdapterHost },
        Logger,
      ],
    }).compile()

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter)
    logger = module.get<Logger>(Logger)
  })

  it('should be defined', () => {
    expect(filter).toBeDefined()
  })

  it('should handle HttpException', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN)
    const host = createMockArgumentsHost()

    filter.catch(exception, host)

    const responseBody = {
      message: 'Forbidden',
      status: HttpStatus.FORBIDDEN,
      timestamp: expect.any(String),
    }

    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      host.switchToHttp().getResponse(),
      responseBody,
      HttpStatus.FORBIDDEN,
    )
  })

  it('should handle ValidationException', () => {
    const exception = new ValidationException([
      { property: 'foo', constraints: { isEmpty: 'should not be empty' } },
    ])
    const host = createMockArgumentsHost()

    filter.catch(exception, host)

    const responseBody = {
      message: 'Validation failed',
      status: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String),
      validationErrors: [
        { property: 'foo', constraints: { isEmpty: 'should not be empty' } },
      ],
    }

    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      host.switchToHttp().getResponse(),
      responseBody,
      HttpStatus.BAD_REQUEST,
    )
  })

  it('should handle non-HttpException', () => {
    const exception = new Error('Unexpected error')
    const host = createMockArgumentsHost()

    jest.spyOn(logger, 'error').mockImplementation(() => {
      // empty body
    })

    filter.catch(exception, host)

    const responseBody = {
      message: 'Internal Server Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String),
    }

    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      host.switchToHttp().getResponse(),
      responseBody,
      HttpStatus.INTERNAL_SERVER_ERROR,
    )

    expect(logger.error).toHaveBeenCalledWith(
      exception.message,
      exception.stack,
      'AllExceptionsFilter',
    )
  })

  function createMockArgumentsHost(): ArgumentsHost {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({}),
      }),
    } as unknown as ArgumentsHost
  }
})
