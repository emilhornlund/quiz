import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { Player } from '../../player/services/models/schemas'
import { QuizService } from '../services'

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
            findOwnerByQuizId: jest.fn(),
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

    const mockOwner = { _id: 'player1' } as Player
    quizService.findOwnerByQuizId.mockResolvedValue(mockOwner)

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext

    const result = await quizAuthGuard.canActivate(mockContext)

    expect(result).toBe(true)
    expect(quizService.findOwnerByQuizId).toHaveBeenCalledWith('quiz1')
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
    } as ExecutionContext

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
    } as ExecutionContext

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

    const mockOwner = { _id: 'player1' } as Player
    quizService.findOwnerByQuizId.mockResolvedValue(mockOwner)

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext

    await expect(quizAuthGuard.canActivate(mockContext)).rejects.toThrow(
      ForbiddenException,
    )
  })

  it('should call findOwnerByQuizId with the correct quizId', async () => {
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

    const mockOwner = { _id: 'player1' } as Player
    quizService.findOwnerByQuizId.mockResolvedValue(mockOwner)

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext

    await quizAuthGuard.canActivate(mockContext)

    expect(quizService.findOwnerByQuizId).toHaveBeenCalledWith('quiz1')
  })
})
