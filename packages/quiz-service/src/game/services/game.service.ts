import { BadRequestException, Injectable } from '@nestjs/common'
import {
  CreateClassicModeGameRequestDto,
  CreateGameResponseDto,
  CreateZeroToOneHundredModeGameRequestDto,
  FindGameResponseDto,
  GameParticipantType,
  QuestionType,
  SubmitQuestionAnswerRequestDto,
} from '@quiz/common'

import { ClientService } from '../../client/services'
import { Client } from '../../client/services/models/schemas'
import { PlayerService } from '../../player/services'
import { QuizService } from '../../quiz/services'

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
   * @param {PlayerService} playerService - The service responsible for managing player information.
   * @param {ClientService} clientService - Service for retrieving client information.
   * @param {QuizService} quizService - Service for managing quiz-related operations.
   */
  constructor(
    private gameRepository: GameRepository,
    private gameTaskTransitionScheduler: GameTaskTransitionScheduler,
    private playerService: PlayerService,
    private clientService: ClientService,
    private quizService: QuizService,
  ) {}

  /**
   * Creates a new game based on the provided quiz ID. It generates a unique 6-digit game PIN,
   * saves the game, and returns a response containing the game ID and JWT token for the host.
   *
   * @param {string} quizId - The ID of the quiz to create a game from.
   * @param {Client} client - The client object containing details of the authorized client creating the game.
   *
   * @returns {Promise<CreateGameResponseDto>} A Promise that resolves to the response object containing the created game details.
   */
  public async createGame(
    quizId: string,
    client: Client,
  ): Promise<CreateGameResponseDto> {
    const { title, mode, questions } =
      await this.quizService.findQuizDocumentByIdOrThrow(quizId)

    const gameDocument = await this.gameRepository.createGame(
      { name: title, mode, questions },
      client,
    )

    await this.gameTaskTransitionScheduler.scheduleTaskTransition(gameDocument)

    return { id: gameDocument._id }
  }

  /**
   * Creates a new game based on the provided request. It generates a unique 6-digit game PIN,
   * saves the game, and returns a response containing the game ID and JWT token for the host.
   *
   * @param {CreateClassicModeGameRequestDto | CreateZeroToOneHundredModeGameRequestDto} request - The details of the game to be created.
   * @param {Client} client - The client object representing the host creating the game.
   *
   * @returns {Promise<CreateGameResponseDto>} A Promise that resolves to the response object containing the created game details.
   */
  public async createGameLegacy(
    request:
      | CreateClassicModeGameRequestDto
      | CreateZeroToOneHundredModeGameRequestDto,
    client: Client,
  ): Promise<CreateGameResponseDto> {
    const gameDocument = await this.gameRepository.createGame(
      buildPartialGameModel(request),
      client,
    )

    await this.gameTaskTransitionScheduler.scheduleTaskTransition(gameDocument)

    return { id: gameDocument._id }
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
   * @param {Client} client - The client object representing the player joining the game.
   * @param {string} nickname - The nickname chosen by the player. Must be unique within the game.
   *
   * @returns {Promise<void>} A Promise that resolves when the player is successfully added to the game.
   *
   * @throws {ActiveGameNotFoundByIDException} If no active game with the specified `gameID`
   * was created in the last 6 hours.
   * @throws {NicknameAlreadyTakenException} If the provided `nickname` is already in use by another
   * player in the game.
   */
  public async joinGame(
    gameID: string,
    client: Client,
    nickname: string,
  ): Promise<void> {
    await this.playerService.updatePlayer(client.player._id, nickname)

    const updatedClient = await this.clientService.findByClientIdOrThrow(
      client._id,
    )

    await this.gameRepository.addPlayer(gameID, updatedClient)
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
   * Submits an answer for the current question in a game.
   *
   * @param {string} playerId - The ID of the player submitting the answer.
   * @param {string} gameID - The ID of the game where the answer is being submitted.
   * @param {object} submitQuestionAnswerRequest - The request containing the answer details.
   *
   * @returns {Promise<void>} Resolves when the answer submission is successful.
   */
  public async submitQuestionAnswer(
    gameID: string,
    playerId: string,
    submitQuestionAnswerRequest: SubmitQuestionAnswerRequestDto,
  ): Promise<void> {
    await this.gameRepository.findAndSaveWithLock(gameID, (gameDocument) => {
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

      const hasAllPlayersAnswered = gameDocument.participants
        .filter(({ type }) => type === GameParticipantType.PLAYER)
        .every((participant) =>
          allAnswers.find(
            (answer) =>
              participant.type === GameParticipantType.PLAYER &&
              answer.playerId === participant.client.player._id,
          ),
        )

      if (hasAllPlayersAnswered) {
        await this.gameTaskTransitionScheduler.scheduleTaskTransition(
          gameDocument,
        )
      }
    }
  }
}
