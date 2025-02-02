import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { QuizVisibility } from '@quiz/common'

import { Player } from '../../player/services/models/schemas'
import { QuizService } from '../services'
import { Quiz } from '../services/models/schemas'

import { QuizAuthGuard } from './quiz-auth.guard'

type MockRequest = {
  client?: { player: Player }
  params?: { quizId?: string }
}

describe('QuizAuthGuard', () => {
  let quizAuthGuard: QuizAuthGuard
  let quizService: jest.Mocked<QuizService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizAuthGuard,
        {
          provide: QuizService,
          useValue: {
            findQuizDocumentByIdOrThrow: jest.fn(),
          },
        },
      ],
    }).compile()

    quizAuthGuard = module.get<QuizAuthGuard>(QuizAuthGuard)
    quizService = module.get(QuizService)
  })

  it('should allow access if the client is authenticated and owns the quiz', async () => {
    const mockRequest: MockRequest = {
      client: {
        player: {
          _id: 'player1',
        } as Player,
      },
      params: {
        quizId: 'quiz1',
      },
    }

    const mockQuiz = {
      visibility: QuizVisibility.Private,
      owner: { _id: 'player1' } as Player,
    } as Quiz
    quizService.findQuizDocumentByIdOrThrow.mockResolvedValue(mockQuiz)

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
    expect(quizService.findQuizDocumentByIdOrThrow).toHaveBeenCalledWith(
      'quiz1',
    )
  })

  it('should throw UnauthorizedException if the client is not authenticated', async () => {
    const mockRequest: MockRequest = {
      client: undefined,
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
      client: {
        player: {
          _id: 'player1',
        } as Player,
      },
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

  it('should throw ForbiddenException if the client is not the owner of the quiz', async () => {
    const mockRequest: MockRequest = {
      client: {
        player: {
          _id: 'player2',
        } as Player,
      },
      params: {
        quizId: 'quiz1',
      },
    }

    const mockQuiz = {
      visibility: QuizVisibility.Private,
      owner: { _id: 'player1' } as Player,
    } as Quiz
    quizService.findQuizDocumentByIdOrThrow.mockResolvedValue(mockQuiz)

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

  it('should call findQuizDocumentByIdOrThrow with the correct quizId', async () => {
    const mockRequest = {
      client: {
        player: {
          _id: 'player1',
        },
      },
      params: {
        quizId: 'quiz1',
      },
    }

    const mockQuiz = {
      visibility: QuizVisibility.Private,
      owner: { _id: 'player1' } as Player,
    } as Quiz
    quizService.findQuizDocumentByIdOrThrow.mockResolvedValue(mockQuiz)

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

    expect(quizService.findQuizDocumentByIdOrThrow).toHaveBeenCalledWith(
      'quiz1',
    )
  })

  it('should allow access to a public quiz when allowPublic is true', async () => {
    const mockRequest: MockRequest = {
      client: {
        player: {
          _id: 'player2',
        } as Player,
      },
      params: {
        quizId: 'quiz1',
      },
    }

    const mockQuiz = {
      visibility: QuizVisibility.Public,
      owner: { _id: 'player1' } as Player,
    } as Quiz
    quizService.findQuizDocumentByIdOrThrow.mockResolvedValue(mockQuiz)

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
