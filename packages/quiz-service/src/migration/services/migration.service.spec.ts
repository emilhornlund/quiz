import { BadRequestException, ConflictException } from '@nestjs/common'
import { AuthProvider } from '@quiz/common'

import { GameRepository, GameResultRepository } from '../../game/repositories'
import { QuizRepository } from '../../quiz/repositories'
import { User, UserRepository } from '../../user/repositories'

import { MigrationService } from './migration.service'

describe('MigrationService', () => {
  let svc: MigrationService
  let gameRepo: jest.Mocked<GameRepository>
  let gameResultRepo: jest.Mocked<GameResultRepository>
  let quizRepo: jest.Mocked<QuizRepository>
  let userRepo: jest.Mocked<UserRepository>

  const LEGACY_ID = 'legacy-id'
  const EXISTING_ID = 'existing-id'
  const UPDATE: Partial<User> = { email: 'new@example.com' }

  beforeEach(() => {
    gameRepo = {
      updateGameParticipant: jest.fn().mockResolvedValue(undefined),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    gameResultRepo = {
      updateGameResultParticipant: jest.fn().mockResolvedValue(undefined),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    quizRepo = {
      updateQuizOwner: jest.fn().mockResolvedValue(undefined),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    userRepo = {
      findUserById: jest.fn(),
      findUserByIdAndUpdateOrThrow: jest.fn(),
      createUser: jest.fn(),
      findUserByIdOrThrow: jest.fn(),
      deleteUserById: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    svc = new MigrationService(gameRepo, gameResultRepo, quizRepo, userRepo)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn((svc as any).logger, 'log').mockImplementation()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn((svc as any).logger, 'warn').mockImplementation()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn((svc as any).logger, 'error').mockImplementation()
  })

  it('should update in place when legacy exists and updateDetails provided', async () => {
    const fakeUser = { _id: LEGACY_ID, authProvider: AuthProvider.None } as User
    userRepo.findUserById.mockResolvedValue(fakeUser)
    userRepo.findUserByIdAndUpdateOrThrow.mockResolvedValue({
      ...fakeUser,
      ...UPDATE,
    })

    const result = await svc.migrateLegacyPlayerUser<User>(
      LEGACY_ID,
      undefined,
      UPDATE,
    )
    expect(userRepo.findUserById).toHaveBeenCalledWith(LEGACY_ID)
    expect(userRepo.findUserByIdAndUpdateOrThrow).toHaveBeenCalledWith(
      LEGACY_ID,
      UPDATE,
    )
    expect(result.email).toBe(UPDATE.email)
  })

  it('should create new when user not found and updateDetails provided', async () => {
    userRepo.findUserById.mockResolvedValue(null)
    userRepo.createUser.mockResolvedValue({ _id: LEGACY_ID, ...UPDATE } as User)

    const result = await svc.migrateLegacyPlayerUser<User>(
      LEGACY_ID,
      undefined,
      UPDATE,
    )
    expect(userRepo.createUser).toHaveBeenCalledWith({
      _id: LEGACY_ID,
      ...UPDATE,
    })
    expect(result._id).toBe(LEGACY_ID)
  })

  it('should merge when existingUserId given and legacy valid', async () => {
    const legacyUser = {
      _id: LEGACY_ID,
      authProvider: AuthProvider.None,
    } as User
    const existingUser = {
      _id: EXISTING_ID,
      authProvider: AuthProvider.Local,
    } as User

    userRepo.findUserById.mockResolvedValue(legacyUser)
    userRepo.findUserByIdOrThrow.mockResolvedValue(existingUser)

    const result = await svc.migrateLegacyPlayerUser<User>(
      LEGACY_ID,
      EXISTING_ID,
      undefined,
    )
    expect(gameRepo.updateGameParticipant).toHaveBeenCalledWith(
      LEGACY_ID,
      EXISTING_ID,
    )
    expect(gameResultRepo.updateGameResultParticipant).toHaveBeenCalledWith(
      LEGACY_ID,
      EXISTING_ID,
    )
    expect(quizRepo.updateQuizOwner).toHaveBeenCalledWith(
      LEGACY_ID,
      EXISTING_ID,
    )
    expect(userRepo.deleteUserById).toHaveBeenCalledWith(LEGACY_ID)
    expect(result).toBe(existingUser)
  })

  it('should throw when merge fails inside try', async () => {
    const legacyUser = {
      _id: LEGACY_ID,
      authProvider: AuthProvider.None,
    } as User
    userRepo.findUserById.mockResolvedValue(legacyUser)
    userRepo.findUserByIdOrThrow.mockResolvedValue({ _id: EXISTING_ID } as User)
    gameRepo.updateGameParticipant.mockRejectedValue(new Error('oops'))

    await expect(
      svc.migrateLegacyPlayerUser<User>(LEGACY_ID, EXISTING_ID, undefined),
    ).rejects.toBeInstanceOf(BadRequestException)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((svc as any).logger.warn).toHaveBeenCalled()
  })

  it('should conflict when legacy already migrated', async () => {
    const migratedUser = {
      _id: LEGACY_ID,
      authProvider: AuthProvider.Google,
    } as User
    userRepo.findUserById.mockResolvedValue(migratedUser)

    await expect(
      svc.migrateLegacyPlayerUser<User>(LEGACY_ID, undefined, undefined),
    ).rejects.toBeInstanceOf(ConflictException)
  })

  it('should fatal-error when no args and no user found', async () => {
    userRepo.findUserById.mockResolvedValue(null)

    await expect(
      svc.migrateLegacyPlayerUser<User>(LEGACY_ID, undefined, undefined),
    ).rejects.toBeInstanceOf(BadRequestException)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((svc as any).logger.error).toHaveBeenCalled()
  })
})
