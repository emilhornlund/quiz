import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'

export const AuthorizedGameID = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    if (!request.gameID) {
      throw new UnauthorizedException('Game ID is missing or unauthorized.')
    }
    return request.gameID
  },
)
