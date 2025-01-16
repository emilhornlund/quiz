import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import {
  CreateGameResponseDto,
  FindGameResponseDto,
  GameParticipantType,
  SubmitQuestionAnswerRequestDto,
} from '@quiz/common'
import { Redis } from 'ioredis'

import { ClientService } from '../../client/services'
import { Client } from '../../client/services/models/schemas'
import { PlayerService } from '../../player/services'
import { QuizService } from '../../quiz/services'
import {
  ClientNotUniqueException,
  NicknameNotUniqueException,
} from '../exceptions'

import { GameEventPublisher } from './game-event.publisher'
import { GameTaskTransitionScheduler } from './game-task-transition-scheduler'
import { GameRepository } from './game.repository'
import { ParticipantBase, ParticipantPlayer, TaskType } from './models/schemas'
import {
  getRedisPlayerParticipantAnswerKey,
  isClientUnique,
  isNicknameUnique,
  toQuestionTaskAnswer,
} from './utils'

/**
 * Service for managing game operations such as creating games, handling tasks, and game lifecycles.
 *
 * This service coordinates with the game repository for data persistence and
 * uses the GameTaskTransitionScheduler to manage task transitions.
 */
@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name)

  /**
   * Creates an instance of GameService.
   *
   * @param {Redis} redis - The Redis instance used for managing data synchronization and storing answers.
   * @param {GameRepository} gameRepository - Repository for accessing and modifying game data.
   * @param {GameTaskTransitionScheduler} gameTaskTransitionScheduler - Scheduler for handling game task transitions.
   * @param {GameEventPublisher} gameEventPublisher - Service responsible for publishing game events to clients.
   * @param {PlayerService} playerService - The service responsible for managing player information.
   * @param {ClientService} clientService - Service for retrieving client information.
   * @param {QuizService} quizService - Service for managing quiz-related operations.
   */
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private gameRepository: GameRepository,
    private gameTaskTransitionScheduler: GameTaskTransitionScheduler,
    private gameEventPublisher: GameEventPublisher,
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
    const quiz = await this.quizService.findQuizDocumentByIdOrThrow(quizId)

    const gameDocument = await this.gameRepository.createGame(quiz, client)

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
   * @throws {ClientNotUniqueException} If the client has already joined the game.
   * @throws {NicknameNotUniqueException} If the provided `nickname` is already taken in the game.
   */
  public async joinGame(
    gameID: string,
    { _id: clientId, player: { _id: playerId } }: Client,
    nickname: string,
  ): Promise<void> {
    await this.playerService.updatePlayer(playerId, nickname)

    const client = await this.clientService.findByClientIdOrThrow(clientId)

    const now = new Date()

    const newParticipant: ParticipantBase & ParticipantPlayer = {
      type: GameParticipantType.PLAYER,
      client,
      totalScore: 0,
      currentStreak: 0,
      created: now,
      updated: now,
    }

    await this.gameRepository.findAndSaveWithLock(
      gameID,
      async (currentDocument) => {
        if (!isClientUnique(currentDocument.participants, clientId)) {
          throw new ClientNotUniqueException()
        }

        if (!isNicknameUnique(currentDocument.participants, nickname)) {
          throw new NicknameNotUniqueException(nickname)
        }

        currentDocument.participants.push(newParticipant)

        return currentDocument
      },
    )
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
    const answer = toQuestionTaskAnswer(playerId, submitQuestionAnswerRequest)

    const gameDocument = await this.gameRepository.findGameByIDOrThrow(gameID)

    if (
      gameDocument.currentTask.type !== TaskType.Question ||
      gameDocument.currentTask.status !== 'active'
    ) {
      throw new BadRequestException(
        'Current task is either not of question type or not in active status',
      )
    }

    let hasAlreadyAnswered = false

    try {
      hasAlreadyAnswered =
        (
          await this.redis.lrange(
            getRedisPlayerParticipantAnswerKey(gameID),
            0,
            -1,
          )
        )
          .map((value) => JSON.parse(value))
          .filter((value) => value.playerId === playerId).length > 0
    } catch (error) {
      this.logger.error('Failed to submit question answer', error)
      throw new BadRequestException('Failed to submit question answer')
    }

    if (hasAlreadyAnswered) {
      throw new BadRequestException('Answer already provided')
    }

    let currentAnswerCount = 0
    const serializedValue = JSON.stringify(answer)

    try {
      currentAnswerCount = await this.redis.rpush(
        getRedisPlayerParticipantAnswerKey(gameID),
        serializedValue,
      )
    } catch (error) {
      this.logger.error('Failed to submit question answer', error)
      throw new BadRequestException('Failed to submit question answer')
    }

    const playerCount = gameDocument.participants.filter(
      (participant) => participant.type === GameParticipantType.PLAYER,
    ).length

    try {
      await this.redis.ltrim(
        getRedisPlayerParticipantAnswerKey(gameID),
        0,
        playerCount - 1,
      )
    } catch (error) {
      this.logger.error('Failed to submit question answer', error)
      throw new BadRequestException('Failed to submit question answer')
    }

    if (currentAnswerCount === playerCount) {
      await this.gameTaskTransitionScheduler.scheduleTaskTransition(
        gameDocument,
      )
    } else {
      await this.gameEventPublisher.publish(gameDocument)
    }
  }
}
