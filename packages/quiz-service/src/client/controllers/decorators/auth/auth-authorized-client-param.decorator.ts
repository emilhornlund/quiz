import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'

import { Client } from '../../../services/models/schemas'

/**
 * Extracts the `Client` entity from the request object.
 *
 * - Throws `UnauthorizedException` if the `client` property is missing from the request.
 *
 * Usage:
 * ```typescript
 * @Get('/example')
 * public async exampleEndpoint(@AuthorizedClientParam() client: Client): Promise<void> {
 *   console.log(client);
 * }
 * ```
 *
 * @param {ExecutionContext} ctx - The execution context for the request.
 * @returns {Client} The authorized client.
 */
export const AuthorizedClientParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Client => {
    const request = ctx.switchToHttp().getRequest()

    if (!request.client) {
      throw new UnauthorizedException('Unauthorized')
    }

    return request.client
  },
)
