import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import {
  CreateGameResponseDto,
  GameParticipantPlayerDto,
  GameParticipantType,
  GameStatus,
  MultiChoiceQuestionCorrectAnswerDto,
  PaginatedGameHistoryDto,
  PinQuestionCorrectAnswerDto,
  PuzzleQuestionCorrectAnswerDto,
  QuestionType,
  RangeQuestionCorrectAnswerDto,
  SubmitQuestionAnswerRequestDto,
  TrueFalseQuestionCorrectAnswerDto,
  TypeAnswerQuestionCorrectAnswerDto,
} from '@quiz/common'
import { Redis } from 'ioredis'

import { PlayerNotFoundException } from '../../game-core/exceptions'
import { GameRepository } from '../../game-core/repositories'
import { TaskType } from '../../game-core/repositories/models/schemas'
import {
  getRedisPlayerParticipantAnswerKey,
  isParticipantPlayer,
} from '../../game-core/utils'
import { GameEventPublisher } from '../../game-event/services'
import {
  buildGameQuitEvent,
  toQuestionTaskAnswer,
} from '../../game-event/utils'
import { GameTaskTransitionScheduler } from '../../game-task/services'
import { buildQuitTask, rebuildQuestionResultTask } from '../../game-task/utils'
import {
  isMultiChoiceCorrectAnswer,
  isPinCorrectAnswer,
  isPuzzleCorrectAnswer,
  isRangeCorrectAnswer,
  isTrueFalseCorrectAnswer,
  isTypeAnswerCorrectAnswer,
} from '../../game-task/utils/question-answer-type-guards'
import { isQuestionResultTask } from '../../game-task/utils/task-type-guards'
import { QuizRepository } from '../../quiz/repositories'
import { User } from '../../user/repositories'
import {
  NicknameNotUniqueException,
  PlayerNotUniqueException,
} from '../exceptions'

import { isNicknameUnique, isPlayerUnique } from './utils'

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
   * @param redis - The Redis instance used for answer synchronization and task coordination.
   * @param gameRepository - Repository responsible for reading and persisting game documents.
   * @param gameTaskTransitionScheduler - Scheduler responsible for task transitions and time-based progression.
   * @param gameEventPublisher - Service responsible for publishing game events to clients.
   * @param quizRepository - Repository for accessing and modifying quiz documents.
   */
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly gameRepository: GameRepository,
    private readonly gameTaskTransitionScheduler: GameTaskTransitionScheduler,
    private readonly gameEventPublisher: GameEventPublisher,
    private readonly quizRepository: QuizRepository,
  ) {}

  /**
   * Creates a new game based on the provided quiz ID. It generates a unique 6-digit game PIN,
   * saves the game, and returns a response containing the game ID and JWT token for the host.
   *
   * @param quizId - The ID of the quiz to create a game from.
   * @param user - The user object containing details of the authorized user creating the game.
   *
   * @returns A Promise that resolves to the response object containing the created game details.
   */
  public async createGame(
    quizId: string,
    user: User,
  ): Promise<CreateGameResponseDto> {
    const quiz = await this.quizRepository.findQuizByIdOrThrow(quizId)

    const gameDocument = await this.gameRepository.createGame(quiz, user)

    await this.gameTaskTransitionScheduler.scheduleTaskTransition(gameDocument)

    return { id: gameDocument._id }
  }

  /**
   * Retrieves games where the given user has participated.
   *
   * @param participantId - The ID of the participant whose games should be fetched.
   * @param offset - The number of games to skip for pagination.
   * @param limit - The maximum number of games to return.
   * @returns A paginated list of game history DTOs.
   */
  public async findGamesByParticipantId(
    participantId: string,
    offset: number = 0,
    limit: number = 5,
  ): Promise<PaginatedGameHistoryDto> {
    const { results, total } =
      await this.gameRepository.findGamesByParticipantId(
        participantId,
        offset,
        limit,
      )

    return {
      results: results.map((gameDocument) => {
        const participant = gameDocument.participants?.find(
          (participant) => participant.participantId === participantId,
        )

        if (!participant) {
          throw new Error(
            `Participant ${participantId} not found in game ${gameDocument._id}`,
          )
        }

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
   * @param gameId - The unique identifier of the game the player wants to join.
   * @param participantId - The unique identifier of the player joining the game.
   * @param nickname - The nickname chosen by the player. Must be unique within the game.
   *
   * @returns {Promise<void>} A Promise that resolves when the player is successfully added to the game.
   *
   * @throws {ActiveGameNotFoundByIDException} If no active game with the specified `gameID` exists.
   * @throws {NicknameNotUniqueException} If the provided `nickname` is already taken in the game.
   */
  public async joinGame(
    gameId: string,
    participantId: string,
    nickname: string,
  ): Promise<void> {
    const gameDocument = await this.gameRepository.findGameByIDOrThrow(gameId)

    if (!isPlayerUnique(gameDocument.participants, participantId)) {
      throw new PlayerNotUniqueException()
    }

    if (!isNicknameUnique(gameDocument.participants, nickname)) {
      throw new NicknameNotUniqueException(nickname)
    }

    const now = new Date()

    const savedGameDocument = await this.gameRepository.findAndSaveWithLock(
      gameId,
      async (currentDocument) => {
        currentDocument.participants.push({
          participantId,
          type: GameParticipantType.PLAYER,
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

    await this.gameEventPublisher.publish(savedGameDocument)
  }

  /**
   * Retrieves the current list of player participants for a game.
   *
   * @param gameId - The unique identifier of the game.
   * @returns The list of player participants for the specified game.
   */
  public async getPlayerParticipants(
    gameId: string,
  ): Promise<GameParticipantPlayerDto[]> {
    const gameDocument = await this.gameRepository.findGameByIDOrThrow(gameId)

    return gameDocument.participants.filter(isParticipantPlayer).map(
      ({ participantId, nickname }): GameParticipantPlayerDto => ({
        id: participantId,
        nickname,
      }),
    )
  }

  /**
   * Removes a player from a game.
   *
   * This method removes a specified player from a game. It enforces the following rules:
   * - Players can only remove themselves.
   * - Hosts can remove any player except themselves.
   *
   * @param authorizedParticipantId - The unique identifier of the participant performing the removal.
   * @param gameId - The unique identifier of the game.
   * @param participantIdToRemove - The unique identifier of the player to remove.
   *
   * @returns A Promise that resolves when the player is successfully removed from the game.
   *
   * @throws {PlayerNotFoundException} If the specified player does not exist in the game.
   * @throws {ForbiddenException} If the participant is not authorized to remove the specified player.
   */
  public async leaveGame(
    authorizedParticipantId: string,
    gameId: string,
    participantIdToRemove: string,
  ): Promise<void> {
    const gameDocument = await this.gameRepository.findGameByIDOrThrow(gameId)

    const currentParticipant = gameDocument.participants.find(
      (participant) => participant.participantId === authorizedParticipantId,
    )

    const participantToRemove = gameDocument.participants.find(
      (participant) => participant.participantId === participantIdToRemove,
    )

    if (!participantToRemove) {
      throw new PlayerNotFoundException(participantIdToRemove)
    }

    if (
      !currentParticipant ||
      participantToRemove.type !== GameParticipantType.PLAYER ||
      (currentParticipant.type === GameParticipantType.PLAYER &&
        authorizedParticipantId !== participantIdToRemove)
    ) {
      throw new ForbiddenException('Forbidden to remove player')
    }

    const savedGameDocument = await this.gameRepository.findAndSaveWithLock(
      gameId,
      async (currentDocument) => {
        currentDocument.participants = currentDocument.participants.filter(
          (participant) => participant.participantId !== participantIdToRemove,
        )
        return currentDocument
      },
    )

    await this.gameEventPublisher.publish(savedGameDocument)

    if (currentParticipant.type === GameParticipantType.HOST) {
      await this.gameEventPublisher.publishParticipantEvent(
        participantToRemove,
        buildGameQuitEvent(savedGameDocument.status),
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
      | TypeAnswerQuestionCorrectAnswerDto
      | PinQuestionCorrectAnswerDto
      | PuzzleQuestionCorrectAnswerDto,
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
        ...(correctAnswerRequest.type === QuestionType.Pin
          ? [
              {
                type: QuestionType.Pin,
                value: `${correctAnswerRequest.positionX},${correctAnswerRequest.positionY}`,
              },
            ]
          : []),
        ...(correctAnswerRequest.type === QuestionType.Puzzle
          ? [
              {
                type: QuestionType.Puzzle,
                value: correctAnswerRequest.values,
              },
            ]
          : []),
      ]

      const updatedQuestionResultTask = rebuildQuestionResultTask(gameDocument)

      const savedGameDocument = await this.gameRepository.findAndSaveWithLock(
        gameID,
        async (currentDocument) => {
          currentDocument.currentTask = updatedQuestionResultTask
          return currentDocument
        },
      )

      await this.gameEventPublisher.publish(savedGameDocument)
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
      | TypeAnswerQuestionCorrectAnswerDto
      | PinQuestionCorrectAnswerDto
      | PuzzleQuestionCorrectAnswerDto,
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

          const isExistingCorrectPinAnswer =
            isPinCorrectAnswer(correctAnswer) &&
            correctAnswerRequest.type === QuestionType.Pin &&
            correctAnswer.value ===
              `${correctAnswerRequest.positionX},${correctAnswerRequest.positionY}`

          const isExistingCorrectPuzzleAnswer =
            isPuzzleCorrectAnswer(correctAnswer) &&
            correctAnswerRequest.type === QuestionType.Puzzle &&
            correctAnswer.value === correctAnswerRequest.values

          return !(
            isExistingCorrectMultiChoiceAnswer ||
            isExistingCorrectRangeAnswer ||
            isExistingCorrectTrueFalseAnswer ||
            isExistingCorrectTypeAnswer ||
            isExistingCorrectPinAnswer ||
            isExistingCorrectPuzzleAnswer
          )
        })

      const updatedQuestionResultTask = rebuildQuestionResultTask(gameDocument)

      const savedGameDocument = await this.gameRepository.findAndSaveWithLock(
        gameID,
        async (currentDocument) => {
          currentDocument.currentTask = updatedQuestionResultTask
          return currentDocument
        },
      )

      await this.gameEventPublisher.publish(savedGameDocument)
    } else {
      throw new BadRequestException(
        'Current task is either not of question result type or not in active status',
      )
    }
  }

  /**
   * Deletes all games that are associated with the given quiz ID.
   *
   * @param {string} quizId - The unique identifier of the quiz.
   * @returns {Promise<void>} - Confirms successful deletion of the games.
   */
  public async deleteQuiz(quizId: string): Promise<void> {
    const deletedCount = await this.gameRepository.deleteGamesByQuizId(quizId)
    this.logger.log(
      `Deleted '${deletedCount}' games by their quizId '${quizId}'.`,
    )
  }

  /**
   * Ends the active game by transitioning it into the Quit task.
   *
   * The current task is archived, the Quit task is activated, and the game
   * status is set to TERMINATED. If the game is already in the Quit task,
   * the operation is a no-op.
   *
   * The updated game state is then published to connected clients.
   *
   * @param gameId - The game ID to terminate.
   */
  public async quitGame(gameId: string): Promise<void> {
    const savedGame = await this.gameRepository.findAndSaveWithLock(
      gameId,
      async (game) => {
        if (game.currentTask.type !== TaskType.Quit) {
          game.previousTasks.push(game.currentTask)
          game.currentTask = buildQuitTask()
          game.status = GameStatus.Terminated
        }
        return game
      },
    )

    await this.gameEventPublisher.publish(savedGame)
  }
}
