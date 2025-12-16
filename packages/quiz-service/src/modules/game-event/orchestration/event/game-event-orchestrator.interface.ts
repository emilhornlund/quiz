import {
  GameEvent,
  GameStatus,
  SubmitQuestionAnswerRequestDto,
} from '@quiz/common'

import {
  GameDocument,
  Participant,
  ParticipantPlayerWithBase,
  QuestionTaskAnswer,
} from '../../../game-core/repositories/models/schemas'

import { GameEventMetaData } from './game-event-metadata.interface'

export interface GameEventOrchestrator {
  /**
   * Builds the current host-facing SSE game event from the game document.
   *
   * @param game - Current persisted game state.
   * @param metadata - Optional event metadata (submission counts, player submission, etc.).
   * @returns The host-facing `GameEvent` for the current task/state.
   */
  buildHostGameEvent(
    game: GameDocument,
    metadata?: Partial<GameEventMetaData>,
  ): GameEvent

  /**
   * Builds the current player-facing SSE game event from the game document.
   *
   * @param game - Current persisted game state.
   * @param player - The player participant for whom the event should be tailored.
   * @param metadata - Optional event metadata (submission counts, player submission, etc.).
   * @returns The player-facing `GameEvent` for the current task/state.
   */
  buildPlayerGameEvent(
    game: GameDocument,
    player: ParticipantPlayerWithBase,
    metadata?: Partial<GameEventMetaData>,
  ): GameEvent

  /**
   * Converts an incoming submit-answer request into a persisted `QuestionTaskAnswer`.
   *
   * @param playerId - The participant ID of the player submitting the answer.
   * @param submitQuestionAnswerRequest - The request payload containing the question type and answer value.
   * @returns A normalized `QuestionTaskAnswer` ready to be stored or published.
   */
  toQuestionTaskAnswer(
    playerId: string,
    submitQuestionAnswerRequest: SubmitQuestionAnswerRequestDto,
  ): QuestionTaskAnswer

  /**
   * Deserializes a JSON string into a `QuestionTaskAnswer`.
   *
   * @param serializedValue - JSON string representation of a stored answer.
   * @returns A `QuestionTaskAnswer` with the correct `created` date and typed answer value.
   */
  toQuestionTaskAnswerFromString(serializedValue: string): QuestionTaskAnswer

  /**
   * Produces a tuple containing:
   * - all deserialized answers for the current question task, and
   * - base metadata such as submission counts.
   *
   * @param serializedAnswers - Answers fetched from Redis (serialized as JSON strings).
   * @param metaData - Existing metadata to merge into the computed base metadata.
   * @param participants - All participants in the game, used to compute totals.
   * @returns A tuple of `[answers, metadata]` used when building game events.
   */
  toBaseQuestionTaskEventMetaDataTuple(
    serializedAnswers: string[],
    metaData: Partial<GameEventMetaData>,
    participants: Participant[],
  ): [QuestionTaskAnswer[], Partial<GameEventMetaData>]

  /**
   * Builds player-specific metadata for a question task event.
   *
   * @param answers - All submitted answers for the current question task.
   * @param participant - The player participant for whom metadata should be derived.
   * @returns Player-specific metadata, including that player’s submitted answer (if present).
   */
  toPlayerQuestionPlayerEventMetaData(
    answers: QuestionTaskAnswer[],
    participant: ParticipantPlayerWithBase,
  ): Partial<GameEventMetaData>

  /**
   * Builds the quit event payload for the provided game status.
   *
   * @param status - The current game status.
   * @returns A `GameQuitEvent` describing the game termination state.
   */
  buildGameQuitEvent(status: GameStatus): { type: string; status: string }
}
