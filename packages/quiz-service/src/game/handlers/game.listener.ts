import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import { GameService } from '../services'

/**
 * Listens to events and triggers appropriate game-related logic.
 */
@Injectable()
export class GameListener {
  /**
   * Initializes the GameListener.
   *
   * @param gameService - Service responsible for managing related game entities.
   */
  constructor(private readonly gameService: GameService) {}

  /**
   * Handles the deletion of a quiz.
   * When a quiz is deleted, this listener receives the `quiz.deleted` event
   * and deletes all associated game entities.
   *
   * @param payload - The event payload containing the quiz ID.
   */
  @OnEvent('quiz.deleted')
  public async handleQuizDeleted({
    quizId,
  }: {
    quizId: string
  }): Promise<void> {
    await this.gameService.deleteQuiz(quizId)
  }
}
