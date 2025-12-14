import { BadRequestException } from '@nestjs/common'
import { AuthProvider } from '@quiz/common'

import { computeMigrationToken } from '../../../test-utils/utils'
import { GameRepository, GameResultRepository } from '../../game/repositories'
import { QuizRepository } from '../../quiz/repositories'
import { UserNotFoundByMigrationTokenException } from '../../user/exceptions'
import { NoneUser, User, UserRepository } from '../../user/repositories'

import { MigrationService } from './migration.service'

describe('MigrationService', () => {
  let svc: MigrationService
  let gameRepo: jest.Mocked<GameRepository>
  let gameResultRepo: jest.Mocked<GameResultRepository>
  let quizRepo: jest.Mocked<QuizRepository>
  let userRepo: jest.Mocked<UserRepository>

  const LEGACY_CLIENT_ID = 'legacy-client-id'
  const LEGACY_PLAYER_ID = 'legacy-player-id'
  const MIGRATION_TOKEN = computeMigrationToken(
    LEGACY_CLIENT_ID,
    LEGACY_PLAYER_ID,
  )
  const EXISTING_ID = 'existing-id'
  const UPDATE: Partial<User> = { email: 'new@example.com' }

  beforeEach(() => {
    gameRepo = {
      updateGameParticipant: jest.fn().mockResolvedValue(undefined),
    } as any

    gameResultRepo = {
      updateGameResultParticipant: jest.fn().mockResolvedValue(undefined),
    } as any

    quizRepo = {
      updateQuizOwner: jest.fn().mockResolvedValue(undefined),
    } as any

    userRepo = {
      findUserById: jest.fn(),
      removeMigrationTokenForUserOrThrow: jest.fn(),
      findUserByIdAndUpdateOrThrow: jest.fn(),
      createUser: jest.fn(),
      findUserByIdOrThrow: jest.fn(),
      deleteUserById: jest.fn(),
    } as any

    svc = new MigrationService(gameRepo, gameResultRepo, quizRepo, userRepo)

    jest.spyOn((svc as any).logger, 'log').mockImplementation()
    jest.spyOn((svc as any).logger, 'warn').mockImplementation()
    jest.spyOn((svc as any).logger, 'error').mockImplementation()
  })

  it('should update in place when legacy exists and updateDetails provided', async () => {
    const fakeUser = {
      _id: LEGACY_PLAYER_ID,
      authProvider: AuthProvider.None,
      migrationTokens: [MIGRATION_TOKEN],
    } as NoneUser
    userRepo.removeMigrationTokenForUserOrThrow.mockResolvedValue(fakeUser)
    userRepo.findUserByIdAndUpdateOrThrow.mockResolvedValue({
      ...fakeUser,
      ...UPDATE,
    })

    const result = await svc.migrateLegacyPlayerUser<User>(
      MIGRATION_TOKEN,
      undefined,
      UPDATE,
    )
    expect(userRepo.removeMigrationTokenForUserOrThrow).toHaveBeenCalledWith(
      MIGRATION_TOKEN,
    )
    expect(userRepo.findUserByIdAndUpdateOrThrow).toHaveBeenCalledWith(
      LEGACY_PLAYER_ID,
      UPDATE,
    )
    expect(result.email).toBe(UPDATE.email)
  })

  it('should throw when when user not found by migration token', async () => {
    userRepo.removeMigrationTokenForUserOrThrow.mockRejectedValue(
      new UserNotFoundByMigrationTokenException(),
    )

    await expect(
      svc.migrateLegacyPlayerUser<User>(MIGRATION_TOKEN, undefined, UPDATE),
    ).rejects.toBeInstanceOf(UserNotFoundByMigrationTokenException)
  })

  it('should merge when existingUserId given and legacy valid', async () => {
    const legacyUser = {
      _id: LEGACY_PLAYER_ID,
      authProvider: AuthProvider.None,
      migrationTokens: [MIGRATION_TOKEN],
    } as NoneUser
    const existingUser = {
      _id: EXISTING_ID,
      authProvider: AuthProvider.Local,
    } as User

    userRepo.removeMigrationTokenForUserOrThrow.mockResolvedValue(legacyUser)
    userRepo.findUserByIdOrThrow.mockResolvedValue(existingUser)

    const result = await svc.migrateLegacyPlayerUser<User>(
      MIGRATION_TOKEN,
      EXISTING_ID,
      undefined,
    )
    expect(gameRepo.updateGameParticipant).toHaveBeenCalledWith(
      LEGACY_PLAYER_ID,
      EXISTING_ID,
    )
    expect(gameResultRepo.updateGameResultParticipant).toHaveBeenCalledWith(
      LEGACY_PLAYER_ID,
      EXISTING_ID,
    )
    expect(quizRepo.updateQuizOwner).toHaveBeenCalledWith(
      LEGACY_PLAYER_ID,
      EXISTING_ID,
    )
    expect(userRepo.deleteUserById).toHaveBeenCalledWith(LEGACY_PLAYER_ID)
    expect(result).toBe(existingUser)
  })

  it('should throw when merge fails inside try', async () => {
    const legacyUser = {
      _id: LEGACY_PLAYER_ID,
      authProvider: AuthProvider.None,
      migrationTokens: [MIGRATION_TOKEN],
    } as NoneUser
    userRepo.removeMigrationTokenForUserOrThrow.mockResolvedValue(legacyUser)
    userRepo.findUserByIdOrThrow.mockResolvedValue({ _id: EXISTING_ID } as User)
    gameRepo.updateGameParticipant.mockRejectedValue(new Error('oops'))

    await expect(
      svc.migrateLegacyPlayerUser<User>(
        MIGRATION_TOKEN,
        EXISTING_ID,
        undefined,
      ),
    ).rejects.toBeInstanceOf(BadRequestException)

    expect((svc as any).logger.warn).toHaveBeenCalled()
  })

  it('should fatal-error when no args and no user found', async () => {
    const legacyUser = {
      _id: LEGACY_PLAYER_ID,
      authProvider: AuthProvider.None,
      migrationTokens: [MIGRATION_TOKEN],
    } as NoneUser
    userRepo.removeMigrationTokenForUserOrThrow.mockResolvedValue(legacyUser)

    await expect(
      svc.migrateLegacyPlayerUser<User>(MIGRATION_TOKEN, undefined, undefined),
    ).rejects.toBeInstanceOf(BadRequestException)

    expect((svc as any).logger.error).toHaveBeenCalled()
  })
})
