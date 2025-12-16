import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import * as requestIp from '@supercharge/request-ip'

import { ValidationException } from '../../../../app/exceptions'

/**
 * Decorator for extracting and validating the client's IP address.
 *
 * Throws a `ValidationException` if no IP address can be found on the request.
 */
export const IpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest()
    const ipAddress = requestIp.getClientIp(request)
    if (!ipAddress) {
      throw new ValidationException([
        {
          property: 'ip-address',
          constraints: { notEmpty: 'IP-address is required.' },
        },
      ])
    }
    return ipAddress
  },
)
