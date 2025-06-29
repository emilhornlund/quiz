import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { ValidationException } from '../../../app/exceptions'

/**
 * description here
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
