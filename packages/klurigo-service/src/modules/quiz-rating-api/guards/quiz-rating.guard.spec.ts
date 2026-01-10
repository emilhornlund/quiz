import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { GameRepository } from '../../game-core/repositories'

import { QuizRatingGuard } from './quiz-rating.guard'

describe('QuizRatingGuard', () => {
  let guard: QuizRatingGuard

  type HasCompletedFn =
    GameRepository['hasCompletedGamesByQuizIdAndParticipantId']

  const hasCompletedGamesByQuizIdAndParticipantId: jest.MockedFunction<HasCompletedFn> =
    jest.fn()

  const gameRepository: Pick<
    GameRepository,
    'hasCompletedGamesByQuizIdAndParticipantId'
  > = {
    hasCompletedGamesByQuizIdAndParticipantId,
  }

  const buildContext = (request: unknown): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as unknown as ExecutionContext

  beforeEach(async () => {
    jest.clearAllMocks()

    const moduleRef = await Test.createTestingModule({
      providers: [
        QuizRatingGuard,
        {
          provide: GameRepository,
          useValue: gameRepository,
        },
      ],
    }).compile()

    guard = moduleRef.get(QuizRatingGuard)
  })

  it('throws UnauthorizedException when request.user._id is missing', async () => {
    const context = buildContext({
      user: undefined,
      params: { quizId: 'quiz-1' },
    })

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    )

    expect(hasCompletedGamesByQuizIdAndParticipantId).not.toHaveBeenCalled()
  })

  it('throws BadRequestException when quizId route param is missing', async () => {
    const context = buildContext({
      user: { _id: 'user-1' },
      params: {},
    })

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      BadRequestException,
    )

    expect(hasCompletedGamesByQuizIdAndParticipantId).not.toHaveBeenCalled()
  })

  it('throws ForbiddenException when user has no completed games for the quiz', async () => {
    hasCompletedGamesByQuizIdAndParticipantId.mockResolvedValueOnce(false)

    const context = buildContext({
      user: { _id: 'user-1' },
      params: { quizId: 'quiz-1' },
    })

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    )

    expect(hasCompletedGamesByQuizIdAndParticipantId).toHaveBeenCalledTimes(1)
    expect(hasCompletedGamesByQuizIdAndParticipantId).toHaveBeenCalledWith(
      'quiz-1',
      'user-1',
    )
  })

  it('returns true when user has completed games for the quiz', async () => {
    hasCompletedGamesByQuizIdAndParticipantId.mockResolvedValueOnce(true)

    const context = buildContext({
      user: { _id: 'user-1' },
      params: { quizId: 'quiz-1' },
    })

    await expect(guard.canActivate(context)).resolves.toBe(true)

    expect(hasCompletedGamesByQuizIdAndParticipantId).toHaveBeenCalledTimes(1)
    expect(hasCompletedGamesByQuizIdAndParticipantId).toHaveBeenCalledWith(
      'quiz-1',
      'user-1',
    )
  })
})
