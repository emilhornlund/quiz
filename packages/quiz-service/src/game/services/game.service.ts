import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import {
  CreateClassicModeGameRequestDto,
  CreateGameResponseDto,
  CreateZeroToOneHundredModeGameRequestDto,
  isCreateClassicModeQuestionMultiRequestDto,
  isCreateClassicModeQuestionSliderRequestDto,
  isCreateClassicModeQuestionTrueFalseRequestDto,
  isCreateClassicModeQuestionTypeAnswerRequestDto,
  isCreateZeroToOneHundredModeQuestionSliderRequestDto,
  QuestionType,
} from '@quiz/common'
import { Model } from 'mongoose'

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
   */
  constructor(@InjectModel(Game.name) private gameModel: Model<Game>) {}

  /**
   * Creates a new game based on the provided request. It generates a unique 6-digit game PIN
   * and saves the game in the database.
   *
   * @param request The DTO containing the details of the game to be created.
   * @returns A Promise that resolves with a CreateGameResponseDto containing the new game ID.
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

    return { id: savedGame._id }
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
              duration: question.duration,
            } as QuestionTypeAnswer
          }
        })
        .filter((obj) => !!obj),
      pin,
    }
  }
}
