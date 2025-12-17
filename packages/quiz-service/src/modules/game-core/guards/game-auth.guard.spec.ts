import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import type { Reflector } from '@nestjs/core'
import { GameParticipantType, TokenScope } from '@quiz/common'

import { GameAuthGuard } from './game-auth.guard'

describe('GameAuthGuard', () => {
  const createExecutionContext = (request: unknown): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => 'handler',
      getClass: () => 'class',
    }) as unknown as ExecutionContext

  const createRequest = (overrides?: Partial<any>) => ({
    params: { gameID: 'game-1' },
    payload: {
      scope: TokenScope.Game,
      gameId: 'game-1',
      participantType: 'Host',
    },
    ...overrides,
  })

  let reflector: Pick<Reflector, 'getAllAndOverride'>
  let gameRepository: { findGameByIDOrThrow: jest.Mock }
  let guard: GameAuthGuard

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    }

    gameRepository = {
      findGameByIDOrThrow: jest.fn(),
    }

    guard = new GameAuthGuard(
      reflector as unknown as Reflector,
      gameRepository as any,
    )
  })

  describe('canActivate', () => {
    it('throws BadRequestException when gameID is missing', async () => {
      const request = createRequest({ params: {} })
      const context = createExecutionContext(request)

      await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
        BadRequestException,
      )
    })

    it('throws UnauthorizedException for unknown token scope', async () => {
      const request = createRequest({ payload: { scope: 'Unknown' } })
      const context = createExecutionContext(request)

      await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
        UnauthorizedException,
      )
    })

    it('reads required participant type from reflector', async () => {
      ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined)
      const request = createRequest()
      const context = createExecutionContext(request)

      await expect(guard.canActivate(context)).resolves.toBe(true)
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        expect.anything(),
        ['handler', 'class'],
      )
    })

    describe('TokenScope.Game', () => {
      it('throws ForbiddenException when token gameId does not match requested gameID', async () => {
        ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined)
        const request = createRequest({
          params: { gameID: 'game-1' },
          payload: {
            scope: TokenScope.Game,
            gameId: 'game-2',
            participantType: 'Host',
          },
        })
        const context = createExecutionContext(request)

        await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
          ForbiddenException,
        )
      })

      it('throws ForbiddenException when requiredParticipantType does not match token participantType', async () => {
        ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(
          'Player' as unknown as GameParticipantType,
        )
        const request = createRequest({
          payload: {
            scope: TokenScope.Game,
            gameId: 'game-1',
            participantType: 'Host',
          },
        })
        const context = createExecutionContext(request)

        await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
          ForbiddenException,
        )
      })

      it('allows access when gameId matches and participant type matches (or not required)', async () => {
        ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(
          'Host' as unknown as GameParticipantType,
        )
        const request = createRequest({
          payload: {
            scope: TokenScope.Game,
            gameId: 'game-1',
            participantType: 'Host',
          },
        })
        const context = createExecutionContext(request)

        await expect(guard.canActivate(context)).resolves.toBe(true)
        expect(gameRepository.findGameByIDOrThrow).not.toHaveBeenCalled()
      })

      it('allows access when no participant type is required', async () => {
        ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined)
        const request = createRequest({
          payload: {
            scope: TokenScope.Game,
            gameId: 'game-1',
            participantType: 'Host',
          },
        })
        const context = createExecutionContext(request)

        await expect(guard.canActivate(context)).resolves.toBe(true)
        expect(gameRepository.findGameByIDOrThrow).not.toHaveBeenCalled()
      })
    })

    describe('TokenScope.User', () => {
      it('loads the game via repository with (gameID, false)', async () => {
        ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined)
        gameRepository.findGameByIDOrThrow.mockResolvedValue({
          participants: [{ participantId: 'user-1', type: 'Player' }],
        })

        const request = createRequest({
          payload: { scope: TokenScope.User, sub: 'user-1' },
        })
        const context = createExecutionContext(request)

        await expect(guard.canActivate(context)).resolves.toBe(true)
        expect(gameRepository.findGameByIDOrThrow).toHaveBeenCalledWith(
          'game-1',
          false,
        )
      })

      it('throws ForbiddenException when user is not a participant', async () => {
        ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined)
        gameRepository.findGameByIDOrThrow.mockResolvedValue({
          participants: [{ participantId: 'someone-else', type: 'Player' }],
        })

        const request = createRequest({
          payload: { scope: TokenScope.User, sub: 'user-1' },
        })
        const context = createExecutionContext(request)

        await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
          ForbiddenException,
        )
      })

      it('throws ForbiddenException when required participant type does not match participant.type', async () => {
        ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(
          'Host' as unknown as GameParticipantType,
        )
        gameRepository.findGameByIDOrThrow.mockResolvedValue({
          participants: [{ participantId: 'user-1', type: 'Player' }],
        })

        const request = createRequest({
          payload: { scope: TokenScope.User, sub: 'user-1' },
        })
        const context = createExecutionContext(request)

        await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
          ForbiddenException,
        )
      })

      it('allows access when participant exists and matches required participant type', async () => {
        ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(
          'Player' as unknown as GameParticipantType,
        )
        gameRepository.findGameByIDOrThrow.mockResolvedValue({
          participants: [{ participantId: 'user-1', type: 'Player' }],
        })

        const request = createRequest({
          payload: { scope: TokenScope.User, sub: 'user-1' },
        })
        const context = createExecutionContext(request)

        await expect(guard.canActivate(context)).resolves.toBe(true)
      })

      it('allows access when participant exists and no participant type is required', async () => {
        ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined)
        gameRepository.findGameByIDOrThrow.mockResolvedValue({
          participants: [{ participantId: 'user-1', type: 'Player' }],
        })

        const request = createRequest({
          payload: { scope: TokenScope.User, sub: 'user-1' },
        })
        const context = createExecutionContext(request)

        await expect(guard.canActivate(context)).resolves.toBe(true)
      })
    })
  })
})
