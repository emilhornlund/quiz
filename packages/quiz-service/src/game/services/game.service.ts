import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import {
  CreateGameResponseDto,
  FindGameResponseDto,
  GameParticipantType,
  MultiChoiceQuestionCorrectAnswerDto,
  PaginatedGameHistoryDto,
  QuestionType,
  RangeQuestionCorrectAnswerDto,
  SubmitQuestionAnswerRequestDto,
  TrueFalseQuestionCorrectAnswerDto,
  TypeAnswerQuestionCorrectAnswerDto,
} from '@quiz/common'
import { Redis } from 'ioredis'

import { ClientService } from '../../client/services'
import { Client } from '../../client/services/models/schemas'
import { PlayerService } from '../../player/services'
import { QuizService } from '../../quiz/services'
import {
  NicknameNotUniqueException,
  PlayerNotFoundException,
  PlayerNotUniqueException,
} from '../exceptions'

import { GameEventPublisher } from './game-event.publisher'
import { GameTaskTransitionScheduler } from './game-task-transition-scheduler'
import { GameRepository } from './game.repository'
import { TaskType } from './models/schemas'
import {
  buildGameQuitEvent,
  getRedisPlayerParticipantAnswerKey,
  isMultiChoiceCorrectAnswer,
  isNicknameUnique,
  isPlayerUnique,
  isQuestionResultTask,
  isRangeCorrectAnswer,
  isTrueFalseCorrectAnswer,
  isTypeAnswerCorrectAnswer,
  rebuildQuestionResultTask,
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
   * This method searches for a game with the specified `gamePIN`. If an active game with the given PIN is found, its
   * ID is returned. Otherwise, an `ActiveGameNotFoundException` is thrown.
   *
   * @param {string} gamePIN - The unique 6-digit game PIN used to identify the game.
   *
   * @returns {Promise<FindGameResponseDto>} A Promise that resolves to a `FindGameResponseDto` containing the ID
   * of the active game if found.
   *
   * @throws {ActiveGameNotFoundByGamePINException} if no active game with the specified `gamePIN` is found .
   */
  public async findActiveGameByGamePIN(
    gamePIN: string,
  ): Promise<FindGameResponseDto> {
    const gameDocument = await this.gameRepository.findGameByPINOrThrow(gamePIN)

    return { id: gameDocument._id }
  }

  /**
   * Retrieves games where the given player has participated.
   *
   * @param playerId - The ID of the player whose games should be fetched.
   * @param offset - The number of games to skip for pagination.
   * @param limit - The maximum number of games to return.
   * @returns A paginated list of game history DTOs.
   */
  public async findGamesByPlayerId(
    playerId: string,
    offset: number = 0,
    limit: number = 5,
  ): Promise<PaginatedGameHistoryDto> {
    const { results, total } = await this.gameRepository.findGamesByPlayerId(
      playerId,
      offset,
      limit,
    )

    return {
      results: results.map((gameDocument) => {
        const participant = gameDocument.participants?.find(
          ({ player }) => player._id === playerId,
        )

        return {
          id: gameDocument._id,
          name: gameDocument.name,
          mode: gameDocument.mode,
          status: gameDocument.status,
          imageCoverURL: gameDocument.quiz?.imageCoverURL,
          created: gameDocument.created,
          ...(participant.type === GameParticipantType.HOST
            ? { participantType: GameParticipantType.HOST }
            : {
                participantType: GameParticipantType.PLAYER,
                rank: participant.rank,
                score: participant.totalScore,
              }),
        }
      }),
      total,
      limit,
      offset,
    }
  }

  /**
   * Adds a player to an active game if the game is found and the nickname is not already taken.
   * Generates a unique token for the joined player.
   *
   * @param {string} gameID - The unique identifier of the game the player wants to join.
   * @param {Client} client - The client object representing the player joining the game.
   * @param {string} nickname - The nickname chosen by the player. Must be unique within the game.
   *
   * @returns {Promise<void>} A Promise that resolves when the player is successfully added to the game.
   *
   * @throws {ActiveGameNotFoundByIDException} If no active game with the specified `gameID` exists.
   * @throws {NicknameNotUniqueException} If the provided `nickname` is already taken in the game.
   */
  public async joinGame(
    gameID: string,
    { player: { _id: playerId } }: Client,
    nickname: string,
  ): Promise<void> {
    const gameDocument = await this.gameRepository.findGameByIDOrThrow(gameID)

    if (!isPlayerUnique(gameDocument.participants, playerId)) {
      throw new PlayerNotUniqueException()
    }

    if (!isNicknameUnique(gameDocument.participants, nickname)) {
      throw new NicknameNotUniqueException(nickname)
    }

    const player = await this.playerService.updatePlayer(playerId, nickname)

    const now = new Date()

    await this.gameRepository.findAndSaveWithLock(
      gameID,
      async (currentDocument) => {
        currentDocument.participants.push({
          type: GameParticipantType.PLAYER,
          player,
          nickname,
          rank: 0,
          totalScore: 0,
          currentStreak: 0,
          created: now,
          updated: now,
        })
        return currentDocument
      },
    )
  }

  /**
   * Removes a player from a game.
   *
   * This method removes a specified player from a game. It enforces the following rules:
   * - Players can only remove themselves.
   * - Hosts can remove any player except themselves.
   *
   * @param client - The client object performing the removal.
   * @param gameID - The unique identifier of the game.
   * @param playerID - The unique identifier of the player to remove.
   *
   * @returns A Promise that resolves when the player is successfully removed from the game.
   *
   * @throws {PlayerNotFoundException} If the specified player does not exist in the game.
   * @throws {ForbiddenException} If the client is not authorized to remove the specified player.
   */
  public async leaveGame(
    client: Client,
    gameID: string,
    playerID: string,
  ): Promise<void> {
    const gameDocument = await this.gameRepository.findGameByIDOrThrow(gameID)

    const currentParticipant = gameDocument.participants.find(
      (participant) => participant.player._id === client.player._id,
    )

    const participantToRemove = gameDocument.participants.find(
      (participant) => participant.player._id === playerID,
    )

    if (!participantToRemove) {
      throw new PlayerNotFoundException(playerID)
    }

    if (
      !currentParticipant ||
      participantToRemove.type !== GameParticipantType.PLAYER ||
      (currentParticipant.type === GameParticipantType.PLAYER &&
        client.player._id !== playerID)
    ) {
      throw new ForbiddenException('Forbidden to remove player')
    }

    await this.gameRepository.findAndSaveWithLock(
      gameID,
      async (currentDocument) => {
        currentDocument.participants = currentDocument.participants.filter(
          (participant) => participant.player._id !== playerID,
        )
        return currentDocument
      },
    )

    if (currentParticipant.type === GameParticipantType.HOST) {
      await this.gameEventPublisher.publishParticipantEvent(
        participantToRemove,
        buildGameQuitEvent(),
      )
    }
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

  /**
   * Adds a new correct answer to the current question result task.
   *
   * The provided answer is appended to the existing list of correct answers,
   * and the question result task is rebuilt to reflect updated results.
   *
   * @param gameID - The ID of the game to update.
   * @param correctAnswerRequest - The new correct answer to append.
   * @throws {BadRequestException} If the current task is not a `QuestionResult` or not in active status.
   */
  public async addCorrectAnswer(
    gameID: string,
    correctAnswerRequest:
      | MultiChoiceQuestionCorrectAnswerDto
      | RangeQuestionCorrectAnswerDto
      | TrueFalseQuestionCorrectAnswerDto
      | TypeAnswerQuestionCorrectAnswerDto,
  ): Promise<void> {
    const gameDocument = await this.gameRepository.findGameByIDOrThrow(gameID)

    if (
      isQuestionResultTask(gameDocument) &&
      gameDocument.currentTask.status === 'active'
    ) {
      gameDocument.currentTask.correctAnswers = [
        ...gameDocument.currentTask.correctAnswers,
        ...(correctAnswerRequest.type === QuestionType.MultiChoice
          ? [
              {
                type: QuestionType.MultiChoice,
                index: correctAnswerRequest.index,
              },
            ]
          : []),
        ...(correctAnswerRequest.type === QuestionType.Range
          ? [
              {
                type: QuestionType.Range,
                value: correctAnswerRequest.value,
              },
            ]
          : []),
        ...(correctAnswerRequest.type === QuestionType.TrueFalse
          ? [
              {
                type: QuestionType.TrueFalse,
                value: correctAnswerRequest.value,
              },
            ]
          : []),
        ...(correctAnswerRequest.type === QuestionType.TypeAnswer
          ? [
              {
                type: QuestionType.TypeAnswer,
                value: correctAnswerRequest.value,
              },
            ]
          : []),
      ]

      const updatedQuestionResultTask = rebuildQuestionResultTask(gameDocument)

      await this.gameRepository.findAndSaveWithLock(
        gameID,
        async (currentDocument) => {
          currentDocument.currentTask = updatedQuestionResultTask
          return currentDocument
        },
      )
    } else {
      throw new BadRequestException(
        'Current task is either not of question result type or not in active status',
      )
    }
  }

  /**
   * Deletes a specific correct answer from the current question result task.
   *
   * The provided answer is removed from the list of correct answers,
   * and the question result task is rebuilt accordingly.
   *
   * @param gameID - The ID of the game to update.
   * @param correctAnswerRequest - The correct answer to remove.
   * @throws {BadRequestException} If the current task is not a `QuestionResult` or not active status.
   */
  public async deleteCorrectAnswer(
    gameID: string,
    correctAnswerRequest:
      | MultiChoiceQuestionCorrectAnswerDto
      | RangeQuestionCorrectAnswerDto
      | TrueFalseQuestionCorrectAnswerDto
      | TypeAnswerQuestionCorrectAnswerDto,
  ): Promise<void> {
    const gameDocument = await this.gameRepository.findGameByIDOrThrow(gameID)

    if (
      isQuestionResultTask(gameDocument) &&
      gameDocument.currentTask.status === 'active'
    ) {
      gameDocument.currentTask.correctAnswers =
        gameDocument.currentTask.correctAnswers.filter((correctAnswer) => {
          const isExistingCorrectMultiChoiceAnswer =
            isMultiChoiceCorrectAnswer(correctAnswer) &&
            correctAnswerRequest.type === QuestionType.MultiChoice &&
            correctAnswer.index === correctAnswerRequest.index

          const isExistingCorrectRangeAnswer =
            isRangeCorrectAnswer(correctAnswer) &&
            correctAnswerRequest.type === QuestionType.Range &&
            correctAnswer.value === correctAnswerRequest.value

          const isExistingCorrectTrueFalseAnswer =
            isTrueFalseCorrectAnswer(correctAnswer) &&
            correctAnswerRequest.type === QuestionType.TrueFalse &&
            correctAnswer.value === correctAnswerRequest.value

          const isExistingCorrectTypeAnswer =
            isTypeAnswerCorrectAnswer(correctAnswer) &&
            correctAnswerRequest.type === QuestionType.TypeAnswer &&
            correctAnswer.value === correctAnswerRequest.value

          return !(
            isExistingCorrectMultiChoiceAnswer ||
            isExistingCorrectRangeAnswer ||
            isExistingCorrectTrueFalseAnswer ||
            isExistingCorrectTypeAnswer
          )
        })

      const updatedQuestionResultTask = rebuildQuestionResultTask(gameDocument)

      await this.gameRepository.findAndSaveWithLock(
        gameID,
        async (currentDocument) => {
          currentDocument.currentTask = updatedQuestionResultTask
          return currentDocument
        },
      )
    } else {
      throw new BadRequestException(
        'Current task is either not of question result type or not in active status',
      )
    }
  }
}
