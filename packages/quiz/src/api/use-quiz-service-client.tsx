import {
  AuthResponseDto,
  CreateGameResponseDto,
  FindGameResponseDto,
  PaginatedQuizResponseDto,
  PlayerResponseDto,
  QuestionDto,
  QuestionType,
  QuizRequestDto,
  QuizResponseDto,
  SubmitQuestionAnswerRequestDto,
} from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import { useAuthContext } from '../context/auth'
import { Client } from '../models'
import {
  CLIENT_LOCAL_STORAGE_KEY,
  TOKEN_LOCAL_STORAGE_KEY,
} from '../utils/constants'
import { notifySuccess } from '../utils/notification.ts'

import {
  ApiPostBody,
  isTokenExpired,
  parseResponseAndHandleError,
  resolveUrl,
} from './api-utils.ts'

/**
 * Provides a set of utility functions to interact with the quiz service API.
 *
 * This hook includes methods for client authentication, token management,
 * and making API requests (GET, POST, PUT, DELETE). It also provides specific
 * methods for retrieving player information and associated quizzes.
 *
 * @returns An object containing the following methods:
 * - `getCurrentPlayer`: Retrieves information about the current player.
 * - `getCurrentPlayerQuizzes`: Retrieves quizzes associated with the current player.
 */
export const useQuizServiceClient = () => {
  const { setToken, setClient, setPlayer } = useAuthContext()

  /**
   * Retrieves the current client ID from local storage or generates a new one if none exists.
   *
   * @returns The client ID as a string.
   */
  const getClientId = (): string => {
    const client = localStorage.getItem(CLIENT_LOCAL_STORAGE_KEY)
    if (client) {
      return (JSON.parse(client) as Client).id
    }
    const id = uuidv4()
    setClient({ id })
    return id
  }

  /**
   * Authenticates the client with the quiz service and retrieves an authentication token.
   *
   * @returns A promise resolving to the authentication response containing the client and player details.
   */
  const authenticate = async (): Promise<AuthResponseDto> => {
    const clientId = getClientId()

    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId }),
    }

    const response = await fetch(resolveUrl('/auth'), options)

    const parsedResponse =
      await parseResponseAndHandleError<AuthResponseDto>(response)

    setClient(parsedResponse.client)
    setPlayer(parsedResponse.player)

    return parsedResponse
  }

  /**
   * Retrieves a valid JWT token, refreshing it if the existing token is expired or missing.
   *
   * @returns A promise resolving to the token as a string, or `undefined` if authentication fails.
   */
  const getToken = async (): Promise<string | undefined> => {
    let token = localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY)
    if (!token || isTokenExpired(token)) {
      token = (await authenticate())?.token
      setToken(token)
      return token
    }
    return token
  }

  /**
   * Makes a generic API request using the specified HTTP method and parameters.
   *
   * @template T - The expected type of the API response.
   * @param method - The HTTP method (e.g., 'GET', 'POST').
   * @param path - The relative path to the API endpoint.
   * @param requestBody - The optional request body for POST or PUT requests.
   * @param token - The optional authentication token. If not provided, it will be retrieved automatically.
   * @returns A promise resolving to the API response as type `T`.
   */
  const apiFetch = async <T extends object | void>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    requestBody?: ApiPostBody,
    token?: string,
  ): Promise<T> => {
    token = token || (await getToken())

    const options = {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(requestBody ? { body: JSON.stringify(requestBody) } : {}),
    }

    const response = await fetch(resolveUrl(path), options)

    return parseResponseAndHandleError<T>(response)
  }

  /**
   * Makes a GET request to the specified API endpoint.
   *
   * @template T - The expected type of the API response.
   * @param path - The relative path to the API endpoint.
   * @returns A promise resolving to the API response as type `T`.
   */
  const apiGet = <T extends object | void>(path: string) =>
    apiFetch<T>('GET', path, undefined)

  /**
   * Makes a POST request to the specified API endpoint.
   *
   * @template T - The expected type of the API response.
   * @param path - The relative path to the API endpoint.
   * @param requestBody - The request body to be sent in the POST request.
   * @returns A promise resolving to the API response as type `T`.
   */
  const apiPost = <T extends object | void>(
    path: string,
    requestBody: ApiPostBody,
  ) => apiFetch<T>('POST', path, requestBody)

  /**
   * Makes a PUT request to the specified API endpoint.
   *
   * @template T - The expected type of the API response.
   * @param path - The relative path to the API endpoint.
   * @param requestBody - The request body to be sent in the PUT request.
   * @returns A promise resolving to the API response as type `T`.
   */
  const apiPut = <T extends object | void>(
    path: string,
    requestBody: ApiPostBody,
  ) => apiFetch<T>('PUT', path, requestBody)

  /**
   * Makes a DELETE request to the specified API endpoint.
   *
   * @template T - The expected type of the API response.
   * @param path - The relative path to the API endpoint.
   * @returns A promise resolving to the API response as type `T`.
   */
  const apiDelete = <T extends object | void>(path: string) =>
    apiFetch<T>('DELETE', path, undefined)

  /**
   * Retrieves information about the current player.
   *
   * @returns A promise resolving to the player information as a `PlayerResponseDto`.
   */
  const getCurrentPlayer = (): Promise<PlayerResponseDto> =>
    apiGet<PlayerResponseDto>('/client/player')

  /**
   * Retrieves the quizzes associated with the current player.
   *
   * @returns A promise resolving to the quizzes in a paginated format as a `PaginatedQuizResponseDto`.
   */
  const getCurrentPlayerQuizzes = (): Promise<PaginatedQuizResponseDto> =>
    apiGet<PaginatedQuizResponseDto>('/client/quizzes')

  /**
   * Creates a new quiz with the specified request data.
   *
   * @param request - The request data for creating a new quiz.
   *
   * @returns A promise resolving to the created quiz details as a `QuizResponseDto`.
   */
  const createQuiz = (request: QuizRequestDto): Promise<QuizResponseDto> =>
    apiPost<QuizResponseDto>('/quizzes', request).then((response) => {
      notifySuccess('Success! Your quiz has been created and is ready to go!')
      return response
    })

  /**
   * Retrieves the details of a specific quiz by its ID.
   *
   * @param quizId - The ID of the quiz to retrieve.
   *
   * @returns A promise resolving to the quiz details as a `QuizResponseDto`.
   */
  const getQuiz = (quizId: string): Promise<QuizResponseDto> =>
    apiGet(`/quizzes/${quizId}`)

  /**
   * Updates an existing quiz with the specified request data.
   *
   * @param quizId - The ID of the quiz to update.
   * @param request - The request data for updating the quiz.
   *
   * @returns A promise resolving to the updated quiz details as a `QuizResponseDto`.
   */
  const updateQuiz = (
    quizId: string,
    request: QuizRequestDto,
  ): Promise<QuizResponseDto> =>
    apiPut<QuizResponseDto>(`/quizzes/${quizId}`, request).then((response) => {
      notifySuccess('Success! Your quiz has been saved and is ready to go!')
      return response
    })

  /**
   * Deletes a quiz by its ID.
   *
   * @param quizId - The ID of the quiz to delete.
   *
   * @returns A promise that resolves when the quiz has been successfully deleted.
   */
  const deleteQuiz = (quizId: string): Promise<void> =>
    apiDelete<void>(`/quizzes/${quizId}`).then(() => {
      notifySuccess('Success! The quiz has been deleted successfully.')
    })

  /**
   * Retrieves the list of questions for a specific quiz.
   *
   * @param quizId - The ID of the quiz to retrieve questions for.
   *
   * @returns A promise resolving to the list of questions as a `QuestionDto`.
   */
  const getQuizQuestions = (quizId: string): Promise<QuestionDto[]> =>
    apiGet(`/quizzes/${quizId}/questions`)

  /**
   * Finds a game using the provided game PIN.
   *
   * @param gamePIN - The PIN of the game to find.
   *
   * @returns A promise resolving to the details of the found game as a `FindGameResponseDto`.
   */
  const findGame = (gamePIN: string): Promise<FindGameResponseDto> =>
    apiGet<FindGameResponseDto>(`/games?gamePIN=${gamePIN}`)

  /**
   * Creates a new game using the provided quizId.
   *
   * @param quizId - The ID of the quiz to create a game from.
   *
   * @returns A promise resolving to the created game details as a `CreateGameResponseDto`.
   */
  const createGame = (quizId: string): Promise<CreateGameResponseDto> =>
    apiPost<CreateGameResponseDto>(`/quizzes/${quizId}/games`, {})

  /**
   * Joins an existing game using the provided game ID and player nickname.
   *
   * @param gameID - The ID of the game to join.
   * @param nickname - The nickname of the player joining the game.
   *
   * @returns A promise that resolves when the player has successfully joined the game.
   */
  const joinGame = (gameID: string, nickname: string): Promise<void> =>
    apiPost<void>(`/games/${gameID}/players`, { nickname })

  /**
   * Marks the current task in the game as completed.
   *
   * @param gameID - The ID of the game whose current task should be completed.
   *
   * @returns A promise that resolves when the task has been successfully completed.
   */
  const completeTask = (gameID: string) =>
    apiPost(`/games/${gameID}/tasks/current/complete`, {}).then(() => {})

  /**
   * Submits an answer to a question in the specified game.
   *
   * @param gameID - The ID of the game where the answer is being submitted.
   * @param submitQuestionAnswerRequest - The request containing the answer details.
   *
   * @returns A promise that resolves when the answer has been successfully submitted.
   */
  const submitQuestionAnswer = async (
    gameID: string,
    submitQuestionAnswerRequest: SubmitQuestionAnswerRequestDto,
  ) => {
    let requestBody: ApiPostBody = {}
    if (submitQuestionAnswerRequest.type === QuestionType.MultiChoice) {
      const { type, optionIndex } = submitQuestionAnswerRequest
      requestBody = { type, optionIndex }
    }
    if (submitQuestionAnswerRequest.type === QuestionType.Range) {
      const { type, value } = submitQuestionAnswerRequest
      requestBody = { type, value }
    }
    if (submitQuestionAnswerRequest.type === QuestionType.TrueFalse) {
      const { type, value } = submitQuestionAnswerRequest
      requestBody = { type, value }
    }
    if (submitQuestionAnswerRequest.type === QuestionType.TypeAnswer) {
      const { type, value } = submitQuestionAnswerRequest
      requestBody = { type, value }
    }
    await apiPost(`/games/${gameID}/answers`, requestBody)
  }

  return {
    getCurrentPlayer,
    getCurrentPlayerQuizzes,
    createQuiz,
    getQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizQuestions,
    findGame,
    createGame,
    joinGame,
    completeTask,
    submitQuestionAnswer,
  }
}
