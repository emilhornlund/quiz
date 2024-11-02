import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'

export const AuthorizedClientID = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    if (!request.clientId) {
      throw new UnauthorizedException('Client ID is missing or unauthorized.')
    }
    return request.clientId
  },
)
