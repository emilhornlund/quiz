import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import {
  Authority,
  GameParticipantType,
  GameTokenDto,
  TokenDto,
  TokenScope,
} from '@quiz/common'

import {
  AuthGuardRequest,
  REQUIRED_AUTHORITIES_KEY,
  REQUIRED_SCOPES_KEY,
} from '../../shared/auth'
import { DEFAULT_USER_AUTHORITIES } from '../../shared/token'
import { TokenService } from '../../token/services'
import { User, UserRepository } from '../../user/repositories'

import { AuthGuard } from './auth.guard'

describe('AuthGuard', () => {
  let guard: AuthGuard
  let reflector: Reflector
  let tokenService: Partial<TokenService>
  let userRepository: Partial<UserRepository>

  const fakeHandler = () => {}
  const fakeClass = class {}

  function makeContext(
    req: Partial<AuthGuardRequest<TokenDto, User>>,
  ): ExecutionContext {
    return {
      getHandler: () => fakeHandler,
      getClass: () => fakeClass,
      switchToHttp: () => ({ getRequest: () => req }),
    } as any
  }

  beforeEach(async () => {
    reflector = new Reflector()
    tokenService = { verifyToken: jest.fn() }
    userRepository = { findUserByIdOrThrow: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: Reflector, useValue: reflector },
        { provide: TokenService, useValue: tokenService },
        { provide: UserRepository, useValue: userRepository },
      ],
    }).compile()

    guard = module.get(AuthGuard)
  })

  it('should allow public routes', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true)
    const ok = await guard.canActivate(makeContext({}))
    expect(ok).toBe(true)
    expect(tokenService.verifyToken).not.toHaveBeenCalled()
  })

  it('should throw if missing Authorization header', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)
    await expect(
      guard.canActivate(makeContext({ headers: {} })),
    ).rejects.toThrow(UnauthorizedException)
  })

  it('should throw if token invalid', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)
    ;(tokenService.verifyToken as jest.Mock).mockRejectedValue(new Error())

    const req = { headers: { authorization: 'Bearer bad' } }
    await expect(guard.canActivate(makeContext(req))).rejects.toThrow(
      UnauthorizedException,
    )
  })

  it('should throw when scope not allowed', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)
    ;(tokenService.verifyToken as jest.Mock).mockResolvedValue({
      sub: 'x',
      scope: TokenScope.Game,
      authorities: [],
    } as TokenDto)

    jest
      .spyOn(reflector, 'getAllAndMerge')
      .mockImplementation((key) =>
        key === REQUIRED_SCOPES_KEY ? [TokenScope.User] : [],
      )

    const req = { headers: { authorization: 'Bearer ok' } }
    await expect(guard.canActivate(makeContext(req))).rejects.toThrow(
      ForbiddenException,
    )
  })

  it('should throw when authorities missing', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)
    ;(tokenService.verifyToken as jest.Mock).mockResolvedValue({
      sub: 'x',
      scope: TokenScope.User,
      authorities: [],
    } as TokenDto)
    jest
      .spyOn(reflector, 'getAllAndMerge')
      .mockImplementation((key) =>
        key === REQUIRED_SCOPES_KEY
          ? []
          : key === REQUIRED_AUTHORITIES_KEY
            ? DEFAULT_USER_AUTHORITIES
            : [],
      )
    const req = { headers: { authorization: 'Bearer ok' } }
    await expect(guard.canActivate(makeContext(req))).rejects.toThrow(
      ForbiddenException,
    )
  })

  it('should authenticate a User scope and attach user', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)
    const token: TokenDto = {
      jti: 'jwt-id',
      sub: 'user-id',
      scope: TokenScope.User,
      authorities: [],
      exp: Date.now() / 1000 + 60,
    }

    ;(tokenService.verifyToken as jest.Mock).mockResolvedValue(token)

    jest.spyOn(reflector, 'getAllAndMerge').mockReturnValue([])

    const fakeUser = { _id: 'user-id', email: 'x' } as any
    ;(userRepository.findUserByIdOrThrow as jest.Mock).mockResolvedValue(
      fakeUser,
    )

    const req: any = { headers: { authorization: 'Bearer ok' } }
    const ok = await guard.canActivate(makeContext(req))
    expect(ok).toBe(true)
    expect(req.payload.scope).toEqual(TokenScope.User)
    expect(req.payload.authorities).toEqual([])
    expect(req.user).toBe(fakeUser)
  })

  it('should throw if user lookup fails in User scope', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)

    const token: TokenDto = {
      jti: 'jwt-id',
      sub: 'no-such',
      scope: TokenScope.User,
      authorities: [],
      exp: Date.now() / 1000 + 60,
    }

    ;(tokenService.verifyToken as jest.Mock).mockResolvedValue(token)

    jest.spyOn(reflector, 'getAllAndMerge').mockReturnValue([])
    ;(userRepository.findUserByIdOrThrow as jest.Mock).mockRejectedValue(
      new Error('404'),
    )

    await expect(
      guard.canActivate(
        makeContext({
          headers: { authorization: 'Bearer ok' },
        }),
      ),
    ).rejects.toThrow(UnauthorizedException)
  })

  it('should authenticate a Game scope and attach gameId and participantType', async () => {
    const token: GameTokenDto = {
      jti: 'jwt-id',
      sub: 'participant-id',
      scope: TokenScope.Game,
      authorities: [Authority.Game],
      exp: Date.now() / 1000 + 60,
      gameId: 'game-id',
      participantType: GameParticipantType.HOST,
    }

    ;(tokenService.verifyToken as jest.Mock).mockResolvedValue(token)

    jest.spyOn(reflector, 'getAllAndMerge').mockReturnValue([])

    const req: any = { headers: { authorization: 'Bearer ok' } }
    const ok = await guard.canActivate(makeContext(req))
    expect(ok).toBe(true)
    expect(req.payload.scope).toEqual(TokenScope.Game)
    expect(req.payload.authorities).toEqual([Authority.Game])
    expect(req.payload.gameId).toEqual('game-id')
    expect(req.payload.participantType).toEqual(GameParticipantType.HOST)
  })

  it('should throw if missing gameId or participantType in Game scope', async () => {
    const token: TokenDto = {
      jti: 'jwt-id',
      sub: 'participant-id',
      scope: TokenScope.Game,
      authorities: [Authority.Game],
      exp: Date.now() / 1000 + 60,
    }

    ;(tokenService.verifyToken as jest.Mock).mockResolvedValue(token)

    jest.spyOn(reflector, 'getAllAndMerge').mockReturnValue([])

    await expect(
      guard.canActivate(
        makeContext({
          headers: { authorization: 'Bearer ok' },
        }),
      ),
    ).rejects.toThrow(UnauthorizedException)
  })
})
