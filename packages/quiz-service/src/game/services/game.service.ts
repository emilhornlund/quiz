import { BadRequestException, Injectable } from '@nestjs/common'
import {
  CreateClassicModeGameRequestDto,
  CreateZeroToOneHundredModeGameRequestDto,
  FindGameResponseDto,
  GameAuthResponseDto,
  GameParticipantType,
  QuestionType,
  SubmitQuestionAnswerRequestDto,
} from '@quiz/common'

import { AuthService } from '../../auth/services'

import { GameTaskTransitionScheduler } from './game-task-transition-scheduler'
import { GameRepository } from './game.repository'
import { TaskType } from './models/schemas'
import { buildPartialGameModel } from './utils'

/**
 * Service for managing game operations such as creating games, handling tasks, and game lifecycles.
 *
 * This service coordinates with the game repository for data persistence and
 * uses the GameTaskTransitionScheduler to manage task transitions.
 */
@Injectable()
export class GameService {
  /**
   * Creates an instance of GameService.
   *
   * @param {GameRepository} gameRepository - Repository for accessing and modifying game data.
   * @param {GameTaskTransitionScheduler} gameTaskTransitionScheduler - Scheduler for handling game task transitions.
   * @param {AuthService} authService - The authentication service for managing game tokens.
   */
  constructor(
    private gameRepository: GameRepository,
    private gameTaskTransitionScheduler: GameTaskTransitionScheduler,
    private authService: AuthService,
  ) {}

  /**
   * Creates a new game based on the provided request. It generates a unique 6-digit game PIN,
   * saves the game, and returns a response containing the game ID and JWT token for the host.
   *
   * @param {CreateClassicModeGameRequestDto | CreateZeroToOneHundredModeGameRequestDto} request - The details of the game to be created.
   *
   * @returns {Promise<GameAuthResponseDto>} A Promise that resolves to a `GameAuthResponseDto`
   * object containing the host's authentication token for game access.
   */
  public async createGame(
    request:
      | CreateClassicModeGameRequestDto
      | CreateZeroToOneHundredModeGameRequestDto,
  ): Promise<GameAuthResponseDto> {
    const gameDocument = await this.gameRepository.createGame(
      buildPartialGameModel(request),
    )

    await this.gameTaskTransitionScheduler.scheduleTaskTransition(gameDocument)

    const token = await this.authService.signGameToken(
      gameDocument._id,
      gameDocument.hostClientId,
      GameParticipantType.HOST,
      Math.floor(gameDocument.expires.getTime() / 1000),
    )

    return { token }
  }

  /**
   * Finds an active game by its unique 6-digit game PIN.
   *
   * This method searches for a game with the specified `gamePIN` that has been
   * created within the last 6 hours. If an active game with the given PIN is
   * found, its ID is returned. Otherwise, an `ActiveGameNotFoundException` is thrown.
   *
   * @param {string} gamePIN - The unique 6-digit game PIN used to identify the game.
   *
   * @returns {Promise<FindGameResponseDto>} A Promise that resolves to a `FindGameResponseDto` containing the ID
   * of the active game if found.
   *
   * @throws {ActiveGameNotFoundByGamePINException} if no active game with the specified
   * `gamePIN` is found within the last 6 hours.
   */
  public async findActiveGameByGamePIN(
    gamePIN: string,
  ): Promise<FindGameResponseDto> {
    const gameDocument = await this.gameRepository.findGameByPINOrThrow(gamePIN)

    return { id: gameDocument._id }
  }

  /**
   * Adds a player to an active game if the game is found within the last 6 hours and
   * the nickname is not already taken. Generates a unique token for the joined player.
   *
   * @param {string} gameID - The unique identifier of the game the player wants to join.
   * @param {string} nickname - The nickname chosen by the player. Must be unique within the game.
   *
   * @returns {Promise<GameAuthResponseDto>} A Promise that resolves to a `GameAuthResponseDto`
   * object containing the player's authentication token for game access.
   *
   * @throws {ActiveGameNotFoundByIDException} If no active game with the specified `gameID`
   * was created in the last 6 hours.
   * @throws {NicknameAlreadyTakenException} If the provided `nickname` is already in use by another
   * player in the game.
   */
  public async joinGame(
    gameID: string,
    nickname: string,
  ): Promise<GameAuthResponseDto> {
    const [gameDocument, newPlayer] = await this.gameRepository.addPlayer(
      gameID,
      nickname,
    )

    const token = await this.authService.signGameToken(
      gameID,
      newPlayer._id,
      GameParticipantType.PLAYER,
      Math.floor(gameDocument.expires.getTime() / 1000),
    )

    return { token }
  }

  /**
   * Completes the current active task for a specified game.
   *
   * @param {string} gameID - The unique identifier of the game.
   *
   * @throws {BadRequestException} if the current task is not in an 'active' status.
   *
   * @returns {Promise<void>} A promise that resolves when the task is completed and further transition scheduling is triggered.
   */
  public async completeCurrentTask(gameID: string): Promise<void> {
    const gameDocument = await this.gameRepository.findGameByIDOrThrow(gameID)

    if (gameDocument.currentTask.status !== 'active') {
      throw new BadRequestException('Current task not in active status')
    }

    await this.gameTaskTransitionScheduler.scheduleTaskTransition(gameDocument)
  }

  /**
   * Handles the submission of an answer for the current active question.
   *
   * @param {string} gameID - The unique identifier of the game.
   * @param {string} playerId - The ID of the player submitting the answer.
   * @param {SubmitQuestionAnswerRequestDto} submitQuestionAnswerRequest - The answer request payload.
   */
  public async submitQuestionAnswer(
    gameID: string,
    playerId: string,
    submitQuestionAnswerRequest: SubmitQuestionAnswerRequestDto,
  ): Promise<void> {
    await this.gameRepository.findAndSave(gameID, (gameDocument) => {
      if (
        gameDocument.currentTask.type !== TaskType.Question ||
        gameDocument.currentTask.status !== 'active'
      ) {
        throw new BadRequestException(
          'Current task is either not of question type or not in active status',
        )
      }

      if (
        gameDocument.currentTask.answers.find(
          (answer) => answer.playerId === playerId,
        )
      ) {
        throw new BadRequestException('Answer already provided')
      }

      if (submitQuestionAnswerRequest.type === QuestionType.MultiChoice) {
        const { type, optionIndex: answer } = submitQuestionAnswerRequest
        gameDocument.currentTask.answers.push({
          type,
          playerId,
          answer,
          created: new Date(),
        })
      }

      if (submitQuestionAnswerRequest.type === QuestionType.Range) {
        const { type, value: answer } = submitQuestionAnswerRequest
        gameDocument.currentTask.answers.push({
          type,
          playerId,
          answer,
          created: new Date(),
        })
      }

      if (submitQuestionAnswerRequest.type === QuestionType.TrueFalse) {
        const { type, value: answer } = submitQuestionAnswerRequest
        gameDocument.currentTask.answers.push({
          type,
          playerId,
          answer,
          created: new Date(),
        })
      }

      if (submitQuestionAnswerRequest.type === QuestionType.TypeAnswer) {
        const { type, value: answer } = submitQuestionAnswerRequest
        gameDocument.currentTask.answers.push({
          type,
          playerId,
          answer,
          created: new Date(),
        })
      }
      return gameDocument
    })

    const gameDocument = await this.gameRepository.findGameByIDOrThrow(gameID)

    if (
      gameDocument.currentTask.type === TaskType.Question &&
      gameDocument.currentTask.status === 'active'
    ) {
      const allAnswers = gameDocument.currentTask.answers

      const hasAllPlayersAnswered = gameDocument.players.every((player) => {
        return allAnswers.find((answer) => answer.playerId === player._id)
      })

      if (hasAllPlayersAnswered) {
        await this.gameTaskTransitionScheduler.scheduleTaskTransition(
          gameDocument,
        )
      }
    }
  }
}
