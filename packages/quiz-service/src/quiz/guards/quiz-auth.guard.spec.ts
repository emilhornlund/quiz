import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { QuizVisibility } from '@quiz/common'

import { User } from '../../modules/user/repositories'
import { QuizRepository } from '../repositories'
import { Quiz } from '../repositories/models/schemas'

import { QuizAuthGuard } from './quiz-auth.guard'

type MockRequest = {
  user?: User
  params?: { quizId?: string }
}

describe('QuizAuthGuard', () => {
  let quizAuthGuard: QuizAuthGuard
  let quizRepository: jest.Mocked<QuizRepository>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizAuthGuard,
        {
          provide: QuizRepository,
          useValue: {
            findQuizByIdOrThrow: jest.fn(),
          },
        },
      ],
    }).compile()

    quizAuthGuard = module.get<QuizAuthGuard>(QuizAuthGuard)
    quizRepository = module.get(QuizRepository)
  })

  it('should allow access if the user is authenticated and owns the quiz', async () => {
    const mockRequest: MockRequest = {
      user: {
        _id: 'player1',
      } as User,
      params: {
        quizId: 'quiz1',
      },
    }

    const mockQuiz = {
      visibility: QuizVisibility.Private,
      owner: { _id: 'player1' } as User,
    } as Quiz
    quizRepository.findQuizByIdOrThrow.mockResolvedValue(mockQuiz)

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext

    jest
      .spyOn(quizAuthGuard['reflector'], 'getAllAndOverride')
      .mockReturnValue(false)

    const result = await quizAuthGuard.canActivate(mockContext)

    expect(result).toBe(true)
    expect(quizRepository.findQuizByIdOrThrow).toHaveBeenCalledWith('quiz1')
  })

  it('should throw UnauthorizedException if the user is not authenticated', async () => {
    const mockRequest: MockRequest = {
      user: undefined,
      params: {
        quizId: 'quiz1',
      },
    }

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext

    jest
      .spyOn(quizAuthGuard['reflector'], 'getAllAndOverride')
      .mockReturnValue(false)

    await expect(quizAuthGuard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    )
  })

  it('should throw BadRequestException if quizId is missing', async () => {
    const mockRequest: MockRequest = {
      user: {
        _id: 'player1',
      } as User,
      params: {},
    }

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext

    jest
      .spyOn(quizAuthGuard['reflector'], 'getAllAndOverride')
      .mockReturnValue(false)

    await expect(quizAuthGuard.canActivate(mockContext)).rejects.toThrow(
      BadRequestException,
    )
  })

  it('should throw ForbiddenException if the user is not the owner of the quiz', async () => {
    const mockRequest: MockRequest = {
      user: {
        _id: 'player2',
      } as User,
      params: {
        quizId: 'quiz1',
      },
    }

    const mockQuiz = {
      visibility: QuizVisibility.Private,
      owner: { _id: 'player1' } as User,
    } as Quiz
    quizRepository.findQuizByIdOrThrow.mockResolvedValue(mockQuiz)

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext

    jest
      .spyOn(quizAuthGuard['reflector'], 'getAllAndOverride')
      .mockReturnValue(false)

    await expect(quizAuthGuard.canActivate(mockContext)).rejects.toThrow(
      ForbiddenException,
    )
  })

  it('should call findQuizByIdOrThrow with the correct quizId', async () => {
    const mockRequest = {
      user: {
        _id: 'player1',
      } as User,
      params: {
        quizId: 'quiz1',
      },
    }

    const mockQuiz = {
      visibility: QuizVisibility.Private,
      owner: { _id: 'player1' } as User,
    } as Quiz
    quizRepository.findQuizByIdOrThrow.mockResolvedValue(mockQuiz)

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext

    jest
      .spyOn(quizAuthGuard['reflector'], 'getAllAndOverride')
      .mockReturnValue(false)

    await quizAuthGuard.canActivate(mockContext)

    expect(quizRepository.findQuizByIdOrThrow).toHaveBeenCalledWith('quiz1')
  })

  it('should allow access to a public quiz when allowPublic is true', async () => {
    const mockRequest: MockRequest = {
      user: {
        _id: 'player2',
      } as User,
      params: {
        quizId: 'quiz1',
      },
    }

    const mockQuiz = {
      visibility: QuizVisibility.Public,
      owner: { _id: 'player1' } as User,
    } as Quiz
    quizRepository.findQuizByIdOrThrow.mockResolvedValue(mockQuiz)

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext

    jest
      .spyOn(quizAuthGuard['reflector'], 'getAllAndOverride')
      .mockReturnValue(true)

    const result = await quizAuthGuard.canActivate(mockContext)

    expect(result).toBe(true)
  })
})
