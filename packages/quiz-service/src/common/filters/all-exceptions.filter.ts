import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'

import { ValidationException } from '../exceptions'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()

    if (exception instanceof Error && !(exception instanceof HttpException)) {
      this.logger.error(
        exception.message,
        exception.stack,
        'AllExceptionsFilter',
      )
    }

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal Server Error'

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const validationErrors =
      exception instanceof ValidationException
        ? exception.validationErrors.map(
            ({ property: field, constraints }) => ({
              field,
              constraints,
            }),
          )
        : undefined

    const timestamp = new Date().toISOString()

    const responseBody = { message, status, validationErrors, timestamp }

    httpAdapter.reply(ctx.getResponse(), responseBody, status)
  }
}
