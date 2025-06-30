import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { ValidationException } from '../../../app/exceptions'

/**
 * Decorator for extracting and validating the client's User-Agent header.
 *
 * Throws a `ValidationException` if the User-Agent header is missing.
 */
export const UserAgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest()
    const userAgent = request.headers['user-agent']
    if (!userAgent) {
      throw new ValidationException([
        {
          property: 'user-agent',
          constraints: { notEmpty: 'User agent is required.' },
        },
      ])
    }
    return userAgent
  },
)
