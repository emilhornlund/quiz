import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import {
  CreateClassicModeGameRequestDto,
  CreateGameResponseDto,
  CreateZeroToOneHundredModeGameRequestDto,
  FindGameResponseDto,
  GameParticipantType,
  isCreateClassicModeQuestionMultiRequestDto,
  isCreateClassicModeQuestionSliderRequestDto,
  isCreateClassicModeQuestionTrueFalseRequestDto,
  isCreateClassicModeQuestionTypeAnswerRequestDto,
  isCreateZeroToOneHundredModeQuestionSliderRequestDto,
  QuestionType,
} from '@quiz/common'
import { Model } from 'mongoose'

import { AuthService } from '../../auth/services'
import { ActiveGameNotFoundException } from '../exceptions'

import {
  Game,
  QuestionMultiChoice,
  QuestionRange,
  QuestionTrueFalse,
  QuestionTypeAnswer,
} from './models/schemas'

/**
 * GameService is responsible for managing game creation and handling
 * business logic related to game sessions, including generating unique game PINs.
 */
@Injectable()
export class GameService {
  /**
   * Creates an instance of GameService.
   *
   * @param gameModel The Mongoose model representing the Game schema.
   * @param authService - The authentication service for managing game tokens.
   */
  constructor(
    @InjectModel(Game.name) private gameModel: Model<Game>,
    private authService: AuthService,
  ) {}

  /**
   * Creates a new game based on the provided request. It generates a unique 6-digit game PIN,
   * saves the game, and returns a response containing the game ID and JWT token for the host.
   *
   * @param request - The details of the game to be created.
   * @returns A Promise containing the ID and token of the created game.
   */
  public async createGame(
    request:
      | CreateClassicModeGameRequestDto
      | CreateZeroToOneHundredModeGameRequestDto,
  ): Promise<CreateGameResponseDto> {
    const gamePIN = await this.generateUniqueGamePIN()

    const savedGame = await new this.gameModel(
      GameService.toGameModel(request, gamePIN),
    ).save()

    const token = await this.authService.signGameToken(
      savedGame._id,
      savedGame.hostClientId,
      GameParticipantType.HOST,
      Math.floor(savedGame.created.getTime() / 1000) + 6 * 60 * 60,
    )

    return { id: savedGame._id, token }
  }

  /**
   * Finds an active game by its unique 6-digit game PIN.
   *
   * This method searches for a game with the specified `gamePIN` that has been
   * created within the last 6 hours. If an active game with the given PIN is
   * found, its ID is returned. Otherwise, an `ActiveGameNotFoundException` is thrown.
   *
   * @param gamePIN - The unique 6-digit game PIN used to identify the game.
   * @returns A Promise that resolves to a `FindGameResponseDto` containing the ID
   * of the active game if found.
   * @throws ActiveGameNotFoundException if no active game with the specified
   * `gamePIN` is found within the last 6 hours.
   */
  public async findActiveGameByGamePIN(
    gamePIN: string,
  ): Promise<FindGameResponseDto> {
    const existingGame = await this.gameModel.findOne({
      pin: gamePIN,
      created: { $gt: new Date(Date.now() - 6 * 60 * 60 * 1000) },
    })

    if (!existingGame) {
      throw new ActiveGameNotFoundException(gamePIN)
    }

    return { id: existingGame._id }
  }

  /**
   * Generates a unique 6-digit game PIN. It checks the database to ensure that no other game
   * with the same PIN was created within the last 6 hours. If such a game exists, it keeps generating
   * new PINs until a unique one is found.
   *
   * @private
   * @returns A Promise that resolves with a unique 6-digit game PIN.
   */
  private async generateUniqueGamePIN(): Promise<string> {
    let isUnique = false
    let gamePIN: string

    while (!isUnique) {
      gamePIN = GameService.generateRandomGamePIN()

      // Find a game with the same PIN and created within the last 6 hours
      const existingGame = await this.gameModel.findOne({
        pin: gamePIN,
        created: { $gt: new Date(Date.now() - 6 * 60 * 60 * 1000) }, // 6 hours ago
      })

      if (!existingGame) {
        isUnique = true
      }
    }

    return gamePIN
  }

  /**
   * Generates a random 6-digit game PIN.
   *
   * @private
   * @returns A 6-digit random PIN as a string.
   */
  private static generateRandomGamePIN(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Converts the incoming request DTO into a partial Game model object for saving in the database.
   *
   * @param request The request DTO containing the game details.
   * @param pin The unique 6-digit game PIN.
   * @private
   * @returns A partial Game model object ready for saving.
   */
  private static toGameModel(
    request:
      | CreateClassicModeGameRequestDto
      | CreateZeroToOneHundredModeGameRequestDto,
    pin: string,
  ): Partial<Game> {
    return {
      name: request.name,
      mode: request.mode,
      questions: request.questions
        .map((question) => {
          if (
            isCreateClassicModeQuestionMultiRequestDto(request.mode, question)
          ) {
            return {
              type: QuestionType.Multi,
              question: question.question,
              imageURL: question.imageURL,
              points: question.points,
              duration: question.duration,
              options: question.answers.map((option) => ({
                value: option.value,
                correct: option.correct,
              })),
            } as QuestionMultiChoice
          }

          if (
            isCreateClassicModeQuestionSliderRequestDto(request.mode, question)
          ) {
            return {
              type: QuestionType.Slider,
              question: question.question,
              imageURL: question.imageURL,
              min: question.min,
              max: question.max,
              correct: question.correct,
              points: question.points,
              duration: question.duration,
            } as QuestionRange
          }

          if (
            isCreateZeroToOneHundredModeQuestionSliderRequestDto(
              request.mode,
              question,
            )
          ) {
            return {
              type: QuestionType.Slider,
              question: question.question,
              imageURL: question.imageURL,
              min: 0,
              max: 100,
              correct: question.correct,
              points: question.points,
              duration: question.duration,
            } as QuestionRange
          }

          if (
            isCreateClassicModeQuestionTrueFalseRequestDto(
              request.mode,
              question,
            )
          ) {
            return {
              type: QuestionType.TrueFalse,
              question: question.question,
              imageURL: question.imageURL,
              correct: question.correct,
              points: question.points,
              duration: question.duration,
            } as QuestionTrueFalse
          }

          if (
            isCreateClassicModeQuestionTypeAnswerRequestDto(
              request.mode,
              question,
            )
          ) {
            return {
              type: QuestionType.TypeAnswer,
              question: question.question,
              imageURL: question.imageURL,
              correct: question.correct,
              points: question.points,
              duration: question.duration,
            } as QuestionTypeAnswer
          }
        })
        .filter((obj) => !!obj),
      pin,
    }
  }
}
