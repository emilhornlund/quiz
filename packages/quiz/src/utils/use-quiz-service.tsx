import {
  AuthResponseDto,
  CreateGameRequestDto,
  FindGameResponseDto,
  GameAuthResponseDto,
  PlayerResponseDto,
  QuestionType,
  SubmitQuestionAnswerRequestDto,
} from '@quiz/common'
import { Bounce, toast } from 'react-toastify'

import config from '../config.ts'
import { useClientContext } from '../context/client'

/**
 * Represents the structure of a POST body for API requests.
 */
type ApiPostBody = { [key: string]: unknown }

/**
 * Represents an error that occurs during an API call.
 */
export class ApiError extends Error {
  /**
   * Creates a new instance of ApiError.
   *
   * @param message - The error message.
   */
  constructor(message: string) {
    super(message)
  }
}

/**
 * Provides utility functions to interact with the Quiz Service API.
 */
export const useQuizService = () => {
  const { authenticate } = useClientContext()

  /**
   * Resolves a relative API path to an absolute URL based on the base service URL.
   *
   * @param path - The relative path to the API endpoint.
   * @returns The full URL as a string.
   */
  const resolveUrl = (path: string): string => {
    const baseURL = config.quizServiceUrl
    if (baseURL.endsWith('/') && path.startsWith('/')) {
      return `${baseURL}${path.substring(1)}`
    }
    if (!baseURL.endsWith('/') && !path.startsWith('/')) {
      return `${baseURL}/${path}`
    }
    return `${baseURL}${path}`
  }

  /**
   * Parses an API response and handles errors if the response indicates a failure.
   *
   * @param response - The response object from the fetch call.
   *
   * @returns A promise resolving to the parsed JSON response as type `T`.
   *
   * @throws {ApiError} if the response status is not ok.
   */
  const parseResponseAndHandleError = async <T extends object>(
    response: Response,
  ): Promise<T> => {
    if (response.status === 204) {
      return Promise.resolve({} as T)
    } else if (response.ok) {
      return (await response.json()) as T
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { message } = (await response.json()) as Record<string, any>
      toast.error(message ?? 'Unknown error', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
        transition: Bounce,
      })
      throw new ApiError(message)
    }
  }

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
    if (response.status === 401) {
      const auth = await authenticate()
      if (auth?.token) {
        return apiFetch<T>(method, path, requestBody, auth.token)
      } else {
        return parseResponseAndHandleError<T>(response)
      }
    } else {
      return parseResponseAndHandleError<T>(response)
    }
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

  /**
   * Authenticates a client by its client ID and retrieves an authentication token.
   *
   * @param clientId - The unique identifier of the client.
   * @returns A promise resolving to the authentication response.
   */
  const authenticateClient = (clientId: string): Promise<AuthResponseDto> =>
    apiPost<AuthResponseDto>('/auth', { clientId })

  /**
   * Retrieves information about the current player.
   *
   * @param token - The authentication token of the client.
   * @returns A promise resolving to the player information.
   */
  const getCurrentPlayer = (token: string): Promise<PlayerResponseDto> =>
    apiGet<PlayerResponseDto>('/client/player', token)

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
    authenticateClient,
    getCurrentPlayer,
    createGame,
    findGame,
    joinGame,
    completeTask,
    submitQuestionAnswer,
  }
}
