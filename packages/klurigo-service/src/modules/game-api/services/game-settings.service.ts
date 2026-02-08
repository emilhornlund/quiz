import { GameSettingsDto } from '@klurigo/common'
import { BadRequestException, Injectable } from '@nestjs/common'

import { GameRepository } from '../../game-core/repositories'
import { TaskType } from '../../game-core/repositories/models/schemas'

/**
 * Service responsible for validating and persisting runtime settings for a game.
 *
 * Settings can only be updated while the game is in an active lobby task.
 */
@Injectable()
export class GameSettingsService {
  /**
   * Creates a new service for managing game runtime settings.
   *
   * @param gameRepository Repository used for loading and persisting game documents.
   */
  constructor(private readonly gameRepository: GameRepository) {}

  /**
   * Persists new runtime settings for a game.
   *
   * Settings can only be changed while the game is in an active lobby task.
   *
   * @param gameId Unique identifier of the game.
   * @param newSettings New runtime settings to persist.
   * @returns The persisted runtime settings.
   *
   * @throws BadRequestException if the game is not currently in an active lobby task.
   */
  public async saveGameSettings(
    gameId: string,
    newSettings: GameSettingsDto,
  ): Promise<GameSettingsDto> {
    const game = await this.gameRepository.findGameByIDOrThrow(gameId)

    if (
      game.currentTask.type !== TaskType.Lobby ||
      game.currentTask.status !== 'active'
    ) {
      throw new BadRequestException(
        'Game settings can only be updated while the game is in an active lobby task.',
      )
    }

    const savedGame = await this.gameRepository.findAndSaveWithLock(
      gameId,
      async (currentDocument) => {
        currentDocument.settings.randomizeQuestionOrder =
          newSettings.randomizeQuestionOrder
        currentDocument.settings.randomizeAnswerOrder =
          newSettings.randomizeAnswerOrder
        return currentDocument
      },
    )

    const { randomizeQuestionOrder, randomizeAnswerOrder } = savedGame.settings

    return {
      randomizeQuestionOrder,
      randomizeAnswerOrder,
    }
  }
}
