import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import {
  QuestionDto,
  QuestionMultiChoiceDto,
  QuestionRangeDto,
  QuestionRequestDto,
  QuestionTrueFalseDto,
  QuestionType,
  QuestionTypeAnswerDto,
} from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import { Player } from '../../player/services/models/schemas'
import { QuestionNotFoundException, QuizNotFoundException } from '../exceptions'

import {
  Question,
  QuestionModel,
  QuestionMultiChoice,
  QuestionRange,
  QuestionTrueFalse,
  QuestionTypeAnswer,
  QuestionWithDiscriminatorVariant,
  Quiz,
  QuizModel,
} from './models/schemas'

/**
 * Service for managing question-related operations.
 */
@Injectable()
export class QuestionService {
  /**
   * Initializes the QuestionService.
   *
   * @param {QuestionModel} questionModel - The Mongoose model for questions.
   * @param {QuizModel} quizModel - The Mongoose model for quizzes.
   * @param {Logger} logger - Logger instance for logging operations.
   */
  constructor(
    @InjectModel(Question.name) private questionModel: QuestionModel,
    @InjectModel(Quiz.name) private quizModel: QuizModel,
    private readonly logger: Logger = new Logger(QuestionService.name),
  ) {}

  /**
   * Creates a new question for the specified quiz.
   *
   * @param {string} quizId - The unique identifier of the quiz to associate with the question.
   * @param {QuestionRequestDto} request - The data for the question to be created.
   *
   * @returns {Promise<QuestionDto>} - The details of the newly created question.
   *
   * @throws {QuizNotFoundException} - If the quiz with the given ID does not exist.
   */
  public async createQuestion(
    quizId: string,
    request: QuestionRequestDto,
  ): Promise<QuestionDto> {
    const quiz = await this.quizModel.findById(quizId).populate('owner')

    if (!quiz) {
      this.logger.warn(`Quiz was not found by id '${quizId}.`)
      throw new QuizNotFoundException(quizId)
    }

    const question = await this.questionModel.create(
      QuestionService.buildCreateQuestionDocument(request, quiz),
    )

    this.logger.log(`Created question with id '${question._id}.'`)

    return QuestionService.buildQuestionDto(question)
  }

  /**
   * Retrieves all questions associated with a given quiz.
   *
   * @param {string} quizId - The unique identifier of the quiz.
   *
   * @returns {Promise<QuestionDto[]>} - A list of all questions associated with the specified quiz.
   *
   * @throws {QuizNotFoundException} - If the quiz with the given ID does not exist.
   */
  public async findAllQuestion(quizId: string): Promise<QuestionDto[]> {
    const quiz = await this.quizModel.findById(quizId).populate('owner')

    if (!quiz) {
      this.logger.warn(`Quiz was not found by id '${quizId}.`)
      throw new QuizNotFoundException(quizId)
    }

    const questions = await this.questionModel.find({ quiz: quizId })
    return questions.map(QuestionService.buildQuestionDto)
  }

  /**
   * Retrieves the details of a specific question by its ID.
   *
   * @param {string} questionId - The unique identifier of the question.
   *
   * @returns {Promise<QuestionDto>} - The details of the requested question.
   *
   * @throws {QuestionNotFoundException} - If no question with the given ID is found.
   */
  public async findQuestion(questionId: string): Promise<QuestionDto> {
    const question = await this.questionModel
      .findById(questionId)
      .populate('quiz')

    if (!question) {
      this.logger.warn(`Question was not found by id '${questionId}.`)
      throw new QuestionNotFoundException(questionId)
    }

    return QuestionService.buildQuestionDto(question)
  }

  /**
   * Retrieves the owner of the quiz associated with a specific question.
   *
   * @param {string} questionId - The unique identifier of the question.
   *
   * @returns {Promise<Player>} - The owner of the quiz associated with the question.
   *
   * @throws {QuestionNotFoundException} - If no question with the given ID is found.
   * @throws {QuizNotFoundException} - If the quiz associated with the question does not exist.
   */
  public async findOwnerByQuestionId(questionId: string): Promise<Player> {
    const question = await this.questionModel
      .findById(questionId)
      .populate('quiz')

    if (!question) {
      this.logger.warn(`Question was not found by id '${questionId}.`)
      throw new QuestionNotFoundException(questionId)
    }

    const quizId = question.quiz._id
    const quiz = await this.quizModel.findById(quizId).populate('owner')

    if (!quiz) {
      this.logger.warn(`Quiz was not found by id '${quizId}.`)
      throw new QuizNotFoundException(quizId)
    }

    return quiz.owner
  }

  /**
   * Updates the details of an existing question.
   *
   * @param {string} questionId - The unique identifier of the question to update.
   * @param {QuestionRequestDto} request - The updated data for the question.
   *
   * @returns {Promise<QuestionDto>} - The updated question's details.
   *
   * @throws {QuestionNotFoundException} - If no question with the given ID is found.
   */
  public async updateQuestion(
    questionId: string,
    request: QuestionRequestDto,
  ): Promise<QuestionDto> {
    const originalQuestion = await this.questionModel
      .findById(questionId)
      .populate('quiz')

    if (!originalQuestion) {
      this.logger.warn(`Question was not found by id '${questionId}.`)
      throw new QuestionNotFoundException(questionId)
    }

    Object.assign(
      originalQuestion,
      QuestionService.buildUpdatedQuestionDocument(request),
    )

    const savedQuestion = await originalQuestion.save()

    this.logger.log(`Updated question with id '${questionId}.'`)

    return QuestionService.buildQuestionDto(savedQuestion)
  }

  /**
   * Deletes a question from the database.
   *
   * @param {string} questionId - The unique identifier of the question to delete.
   *
   * @returns {Promise<void>} - Confirms successful deletion of the question.
   *
   * @throws {QuestionNotFoundException} - If no question with the given ID is found.
   */
  public async deleteQuestion(questionId: string): Promise<void> {
    const deletedQuestion =
      await this.questionModel.findByIdAndDelete(questionId)

    if (!deletedQuestion) {
      this.logger.warn(`Question was not found by id '${questionId}.`)
      throw new QuestionNotFoundException(questionId)
    }
  }

  /**
   * Constructs a `QuestionDto` object from a Mongoose `Question` document.
   *
   * @param {Question} question - The Mongoose question document to transform.
   *
   * @returns {QuestionDto} - The constructed DTO representing the question details.
   * @private
   */
  private static buildQuestionDto(question: Question): QuestionDto {
    const {
      _id: id,
      type,
      text,
      media,
      points,
      duration,
      created,
      updated,
    } = question

    const common: Partial<QuestionDto> = {
      id,
      type,
      question: text,
      media,
      points,
      duration,
      created,
      updated,
    }

    switch (type) {
      case QuestionType.MultiChoice: {
        const cast = question as Question & QuestionMultiChoice
        return {
          ...common,
          type: QuestionType.MultiChoice,
          options: cast.options,
        } as QuestionMultiChoiceDto
      }
      case QuestionType.Range: {
        const cast = question as Question & QuestionRange
        return {
          ...common,
          type: QuestionType.Range,
          min: cast.min,
          max: cast.max,
          correct: cast.correct,
          margin: cast.margin,
        } as QuestionRangeDto
      }
      case QuestionType.TrueFalse: {
        const cast = question as Question & QuestionTrueFalse
        return {
          ...common,
          type: QuestionType.TrueFalse,
          correct: cast.correct,
        } as QuestionTrueFalseDto
      }
      case QuestionType.TypeAnswer: {
        const cast = question as Question & QuestionTypeAnswer
        return {
          ...common,
          type: QuestionType.TypeAnswer,
          options: cast.options,
        } as QuestionTypeAnswerDto
      }
    }
  }

  /**
   * Builds the Mongoose-compatible document for creating a new question.
   *
   * @param {QuestionRequestDto} request - The data for the question to be created.
   * @param {Quiz} quiz - The quiz to associate with the question.
   *
   * @returns {QuestionWithDiscriminatorVariant} - The constructed question document.
   * @private
   */
  private static buildCreateQuestionDocument(
    request: QuestionRequestDto,
    quiz: Quiz,
  ): QuestionWithDiscriminatorVariant {
    const now = new Date()

    const question: Question = {
      _id: uuidv4(),
      type: request.type,
      text: request.question,
      media: request.media,
      quiz,
      points: request.points,
      duration: request.duration,
      created: now,
      updated: now,
    }

    switch (request.type) {
      case QuestionType.MultiChoice:
        return {
          ...question,
          ...({
            type: QuestionType.MultiChoice,
            options: request.options,
          } as QuestionMultiChoice),
        }
      case QuestionType.Range:
        return {
          ...question,
          ...({
            type: QuestionType.Range,
            min: request.min,
            max: request.max,
            correct: request.correct,
            margin: request.margin,
          } as QuestionRange),
        }
      case QuestionType.TrueFalse:
        return {
          ...question,
          ...({
            type: QuestionType.TrueFalse,
            correct: request.correct,
          } as QuestionTrueFalse),
        }
      case QuestionType.TypeAnswer:
        return {
          ...question,
          ...({
            type: QuestionType.TypeAnswer,
            options: request.options,
          } as QuestionTypeAnswer),
        }
    }
  }

  /**
   * Constructs a partial Mongoose document for updating an existing question.
   *
   * @param {QuestionRequestDto} request - The updated question data.
   *
   * @returns {Partial<QuestionWithDiscriminatorVariant>} - The constructed partial document for the update.
   * @private
   */
  private static buildUpdatedQuestionDocument(
    request: QuestionRequestDto,
  ): Partial<QuestionWithDiscriminatorVariant> {
    const common: Partial<Question> = {
      type: request.type,
      text: request.question,
      media: request.media,
      points: request.points,
      duration: request.duration,
      updated: new Date(),
    }

    switch (request.type) {
      case QuestionType.MultiChoice:
        return {
          ...common,
          ...({
            type: QuestionType.MultiChoice,
            options: request.options,
          } as QuestionMultiChoice),
        }
      case QuestionType.Range:
        return {
          ...common,
          ...({
            type: QuestionType.Range,
            min: request.min,
            max: request.max,
            correct: request.correct,
            margin: request.margin,
          } as QuestionRange),
        }
      case QuestionType.TrueFalse:
        return {
          ...common,
          ...({
            type: QuestionType.TrueFalse,
            correct: request.correct,
          } as QuestionTrueFalse),
        }
      case QuestionType.TypeAnswer:
        return {
          ...common,
          ...({
            type: QuestionType.TypeAnswer,
            options: request.options,
          } as QuestionTypeAnswer),
        }
    }
  }
}
