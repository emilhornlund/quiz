import {
  CreateGameRequestDto,
  FindGameResponseDto,
  GameAuthResponseDto,
  QuestionType,
  SubmitQuestionAnswerRequestDto,
} from '@quiz/common'

import {
  ApiPostBody,
  parseResponseAndHandleError,
  resolveUrl,
} from './api-utils.ts'

/**
 * Provides utility functions to interact with the Quiz Service API.
 */
export const useQuizServiceClientLegacy = () => {
  /**
   * Makes a generic API request using the specified method and parameters.
   *
   * @param method - The HTTP method (e.g., 'GET', 'POST').
   * @param path - The relative path to the API endpoint.
   * @param requestBody - The optional request body for POST or PUT requests.
   * @param token - The optional authentication token.
   * @returns A promise resolving to the API response as type `T`.
   */
  const apiFetch = async <T extends object>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    requestBody?: ApiPostBody,
    token?: string,
  ): Promise<T> => {
    const response = await fetch(resolveUrl(path), {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(requestBody ? { body: JSON.stringify(requestBody) } : {}),
    })
    return parseResponseAndHandleError<T>(response)
  }

  /**
   * Makes a GET request to the specified API endpoint.
   *
   * @param path - The relative path to the API endpoint.
   * @param token - The optional authentication token.
   * @returns A promise resolving to the API response as type `T`.
   */
  const apiGet = <T extends object>(path: string, token?: string) =>
    apiFetch<T>('GET', path, undefined, token)

  /**
   * Makes a POST request to the specified API endpoint.
   *
   * @param path - The relative path to the API endpoint.
   * @param requestBody - The request body to be sent in the POST request.
   * @param token - The optional authentication token.
   * @returns A promise resolving to the API response as type `T`.
   */
  const apiPost = <T extends object>(
    path: string,
    requestBody: ApiPostBody,
    token?: string,
  ) => apiFetch<T>('POST', path, requestBody, token)

  const createGame = (
    request: CreateGameRequestDto,
  ): Promise<GameAuthResponseDto> =>
    apiPost<GameAuthResponseDto>('/games', request)

  const findGame = (gamePIN: string): Promise<FindGameResponseDto> =>
    apiGet<FindGameResponseDto>(`/games?gamePIN=${gamePIN}`)

  const joinGame = (
    gameID: string,
    nickname: string,
  ): Promise<GameAuthResponseDto> =>
    apiPost<GameAuthResponseDto>(`/games/${gameID}/players`, { nickname })

  const completeTask = (gameID: string, token: string) =>
    apiPost(`/games/${gameID}/tasks/current/complete`, {}, token).then(() => {})

  const submitQuestionAnswer = async (
    gameID: string,
    token: string,
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
    await apiPost(`/games/${gameID}/answers`, requestBody, token)
  }

  return {
    createGame,
    findGame,
    joinGame,
    completeTask,
    submitQuestionAnswer,
  }
}
