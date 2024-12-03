import {
  AuthResponseDto,
  PaginatedQuizResponseDto,
  PlayerResponseDto,
} from '@quiz/common'

import { useAuthContext } from '../context/auth'
import { Client } from '../models'
import {
  CLIENT_LOCAL_STORAGE_KEY,
  TOKEN_LOCAL_STORAGE_KEY,
} from '../utils/constants'

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
    const id = '85585f4b-35ec-45fc-abd5-c60bb94b2313' // uuidv4()
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
  const apiFetch = async <T extends object>(
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
  const apiGet = <T extends object>(path: string) =>
    apiFetch<T>('GET', path, undefined)

  /**
   * Makes a POST request to the specified API endpoint.
   *
   * @template T - The expected type of the API response.
   * @param path - The relative path to the API endpoint.
   * @param requestBody - The request body to be sent in the POST request.
   * @returns A promise resolving to the API response as type `T`.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const apiPost = <T extends object>(path: string, requestBody: ApiPostBody) =>
    apiFetch<T>('POST', path, requestBody)

  /**
   * Makes a PUT request to the specified API endpoint.
   *
   * @template T - The expected type of the API response.
   * @param path - The relative path to the API endpoint.
   * @param requestBody - The request body to be sent in the PUT request.
   * @returns A promise resolving to the API response as type `T`.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const apiPut = <T extends object>(path: string, requestBody: ApiPostBody) =>
    apiFetch<T>('PUT', path, requestBody)

  /**
   * Makes a DELETE request to the specified API endpoint.
   *
   * @template T - The expected type of the API response.
   * @param path - The relative path to the API endpoint.
   * @returns A promise resolving to the API response as type `T`.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const apiDelete = <T extends object>(path: string) =>
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

  return { getCurrentPlayer, getCurrentPlayerQuizzes }
}
