import { Injectable } from '@nestjs/common'
import {
  GameEvent,
  GameParticipantType,
  GameQuitEvent,
  GameStatus,
  QuestionType,
  SubmitQuestionAnswerRequestDto,
} from '@quiz/common'

import {
  GameDocument,
  Participant,
  ParticipantBase,
  ParticipantPlayer,
  QuestionTaskAnswer,
  QuestionTaskBaseAnswer,
} from '../repositories/models/schemas'
import { buildGameLeaderboardHostEvent } from '../services/utils/events/game-leaderboard-event.utils'
import { buildGameLoadingEvent } from '../services/utils/events/game-loading-event.utils'
import {
  buildGameBeginHostEvent,
  buildGameBeginPlayerEvent,
  buildGameLobbyHostEvent,
  buildGameLobbyPlayerEvent,
} from '../services/utils/events/game-lobby-event.utils'
import { buildGamePodiumHostEvent } from '../services/utils/events/game-podium-event.utils'
import {
  buildGameQuestionHostEvent,
  buildGameQuestionPlayerEvent,
  buildGameQuestionPreviewHostEvent,
  buildGameQuestionPreviewPlayerEvent,
} from '../services/utils/events/game-question-event.utils'
import { buildGameQuitEvent } from '../services/utils/events/game-quit-event.utils'
import {
  buildGameResultHostEvent,
  buildGameResultPlayerEvent,
} from '../services/utils/events/game-result-event.utils'
import {
  isLeaderboardTask,
  isLobbyTask,
  isPodiumTask,
  isQuestionResultTask,
  isQuestionTask,
  isQuitTask,
} from '../services/utils/tasks'

import { GameEventMetaData } from './game-event-metadata.interface'
import { GameEventOrchestrator as IGameEventOrchestrator } from './game-event-orchestrator.interface'

@Injectable()
export class GameEventOrchestrator implements IGameEventOrchestrator {
  /**
   * Constructs an event for the host based on the current state of the game document.
   *
   * @param game - The `GameDocument` representing the current state of the game, including its task and associated data.
   * @param metadata - Metadata including the number of submissions and related player information.
   *
   * @throws {Error} Throws an error if the task type is not recognized.
   *
   * @returns A `GameEvent` tailored for the host, depending on the type and status of the current task.
   */
  public buildHostGameEvent(
    game: GameDocument,
    metadata: Partial<GameEventMetaData> = {},
  ): GameEvent {
    if (isLobbyTask(game)) {
      switch (game.currentTask.status) {
        case 'pending':
          return buildGameLoadingEvent()
        case 'active':
          return buildGameLobbyHostEvent(game)
        case 'completed':
          return buildGameBeginHostEvent()
      }
    }

    if (isQuestionTask(game)) {
      switch (game.currentTask.status) {
        case 'pending':
          return buildGameQuestionPreviewHostEvent(game)
        case 'active':
          return buildGameQuestionHostEvent(
            game,
            metadata.currentAnswerSubmissions ?? 0,
            metadata.totalAnswerSubmissions ?? 0,
          )
        case 'completed':
          return buildGameLoadingEvent()
      }
    }

    if (isQuestionResultTask(game)) {
      switch (game.currentTask.status) {
        case 'pending':
          return buildGameLoadingEvent()
        case 'active':
          return buildGameResultHostEvent(game)
        case 'completed':
          return buildGameLoadingEvent()
      }
    }

    if (isLeaderboardTask(game)) {
      switch (game.currentTask.status) {
        case 'pending':
          return buildGameLoadingEvent()
        case 'active':
          return buildGameLeaderboardHostEvent(game)
        case 'completed':
          return buildGameLoadingEvent()
      }
    }

    if (isPodiumTask(game)) {
      switch (game.currentTask.status) {
        case 'pending':
          return buildGameLoadingEvent()
        case 'active':
          return buildGamePodiumHostEvent(game)
        case 'completed':
          return buildGameLoadingEvent()
      }
    }

    if (isQuitTask(game)) {
      return buildGameQuitEvent(game.status)
    }

    throw new Error('Unknown task')
  }

  /**
   * Constructs an event for a player based on the current state of the game document and the provided player details.
   *
   * @param game - The `GameDocument` representing the current state of the game, including its task and associated data.
   * @param player - The player participant object for whom the event is being built.
   * @param metadata - Metadata containing the number of submissions and related player information.
   *
   * @throws {Error} Throws an error if the task type is not recognized.
   *
   * @returns A `GameEvent` tailored for the player, depending on the type and status of the current task.
   */
  public buildPlayerGameEvent(
    game: GameDocument,
    player: ParticipantBase & ParticipantPlayer,
    metadata: Partial<GameEventMetaData> = {},
  ): GameEvent {
    if (isLobbyTask(game)) {
      switch (game.currentTask.status) {
        case 'pending':
          return buildGameLoadingEvent()
        case 'active':
          return buildGameLobbyPlayerEvent(player)
        case 'completed':
          return buildGameBeginPlayerEvent(player)
      }
    }

    if (isQuestionTask(game)) {
      switch (game.currentTask.status) {
        case 'pending':
          return buildGameQuestionPreviewPlayerEvent(game, player)
        case 'active':
        case 'completed':
          return buildGameQuestionPlayerEvent(
            game,
            player,
            metadata.playerAnswerSubmission,
          )
      }
    }

    if (
      isQuestionResultTask(game) ||
      isLeaderboardTask(game) ||
      isPodiumTask(game)
    ) {
      switch (game.currentTask.status) {
        case 'pending':
          return buildGameLoadingEvent()
        case 'active':
          return buildGameResultPlayerEvent(game, player)
        case 'completed':
          return buildGameLoadingEvent()
      }
    }

    if (isQuitTask(game)) {
      return buildGameQuitEvent(game.status)
    }

    throw new Error('Unknown task')
  }

  /**
   * Converts a player's submitted answer into a question task answer format.
   *
   * This function takes the player ID and the submitted answer data, and returns a
   * properly formatted answer object based on the question type. It supports multiple
   * question types, including multi-choice, range, true/false, and type answer.
   *
   * @param playerId - The unique identifier of the player submitting the answer.
   * @param submitQuestionAnswerRequest - The answer data
   * from the player, including the answer type and value.
   *
   * @returns {QuestionTaskAnswer} The formatted answer object for the current question.
   *
   * @private
   */
  public toQuestionTaskAnswer(
    playerId: string,
    submitQuestionAnswerRequest: SubmitQuestionAnswerRequestDto,
  ): QuestionTaskAnswer {
    const { type } = submitQuestionAnswerRequest

    let answer: string | string[] | number | boolean

    if (type === QuestionType.MultiChoice) {
      answer = submitQuestionAnswerRequest.optionIndex
    } else if (
      type === QuestionType.Range ||
      type === QuestionType.TrueFalse ||
      type === QuestionType.TypeAnswer
    ) {
      answer = submitQuestionAnswerRequest.value
    } else if (type === QuestionType.Pin) {
      answer = `${submitQuestionAnswerRequest.positionX},${submitQuestionAnswerRequest.positionY}`
    } else if (type === QuestionType.Puzzle) {
      answer = submitQuestionAnswerRequest.values
    }

    return {
      type,
      playerId,
      answer,
      created: new Date(),
    }
  }

  /**
   * Deserializes a string to create a `QuestionTaskAnswer` object.
   *
   * @param serializedValue - The serialized string representation of a question task answer.
   *
   * @returns {QuestionTaskAnswer} The deserialized `QuestionTaskAnswer` object.
   */
  public toQuestionTaskAnswerFromString(
    serializedValue: string,
  ): QuestionTaskAnswer {
    const deserializedValue = JSON.parse(serializedValue)

    const base: QuestionTaskBaseAnswer = {
      type: deserializedValue.type as QuestionType,
      playerId: deserializedValue.playerId as string,
      created: new Date(deserializedValue.created as Date),
    }

    let answer: string | string[] | number | boolean

    switch (deserializedValue.type) {
      case QuestionType.MultiChoice:
        answer = deserializedValue.answer as number
        break
      case QuestionType.Range:
        answer = deserializedValue.answer as number
        break
      case QuestionType.TrueFalse:
        answer = deserializedValue.answer as boolean
        break
      case QuestionType.TypeAnswer:
        answer = deserializedValue.answer as string
        break
      case QuestionType.Pin:
        answer = deserializedValue.answer as string
        break
      case QuestionType.Puzzle:
        answer = deserializedValue.answer as string[]
        break
    }

    return { ...base, answer }
  }

  /**
   * Converts serialized answers and participant information into metadata and answers.
   *
   * @param serializedAnswers - An array of serialized answers retrieved from Redis.
   * @param metaData - Partial metadata containing current and total submissions.
   * @param participants - The list of game participants, used to calculate submission-related metadata.
   *
   * @returns A tuple containing deserialized answers and metadata.
   */
  public toBaseQuestionTaskEventMetaDataTuple(
    serializedAnswers: string[],
    metaData: Partial<GameEventMetaData>,
    participants: Participant[],
  ): [QuestionTaskAnswer[], Partial<GameEventMetaData>] {
    const answers = serializedAnswers.map((serializedValue) => {
      const deserializedValue = JSON.parse(serializedValue)

      const base: QuestionTaskBaseAnswer = {
        type: deserializedValue.type as QuestionType,
        playerId: deserializedValue.playerId as string,
        created: new Date(deserializedValue.created as Date),
      }

      let answer: string | string[] | number | boolean

      switch (deserializedValue.type) {
        case QuestionType.MultiChoice:
          answer = deserializedValue.answer as number
          break
        case QuestionType.Range:
          answer = deserializedValue.answer as number
          break
        case QuestionType.TrueFalse:
          answer = deserializedValue.answer as boolean
          break
        case QuestionType.TypeAnswer:
          answer = deserializedValue.answer as string
          break
        case QuestionType.Pin:
          answer = deserializedValue.answer as string
          break
        case QuestionType.Puzzle:
          answer = deserializedValue.answer as string[]
          break
      }

      return { ...base, answer }
    })

    return [
      answers,
      {
        ...metaData,
        currentAnswerSubmissions: serializedAnswers.length,
        totalAnswerSubmissions: participants.filter(
          (participant) => participant.type === GameParticipantType.PLAYER,
        ).length,
      },
    ]
  }

  /**
   * Builds metadata for a player-specific question event based on existing answers.
   *
   * @param answers - The list of answers submitted for the current question task.
   * @param participant - The participant for whom the metadata is generated.
   *
   * @returns Metadata indicating the participant's submitted answer.
   */
  public toPlayerQuestionPlayerEventMetaData(
    answers: QuestionTaskAnswer[],
    participant: ParticipantBase & ParticipantPlayer,
  ): Partial<GameEventMetaData> {
    const playerAnswerSubmission = answers?.find(
      (answer) => answer.playerId === participant.participantId,
    )

    return {
      playerAnswerSubmission,
    }
  }

  /**
   * Builds a quit event for the game.
   *
   * @param status - The current status of the game.
   * @returns A quit event for the game, indicating that the game is terminated.
   */
  public buildGameQuitEvent(status: GameStatus): GameQuitEvent {
    return buildGameQuitEvent(status)
  }
}
