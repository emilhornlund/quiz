import { jwtDecode } from 'jwt-decode'

import config from '../config.ts'
import { notifyError } from '../utils/notification.ts'

/**
 * Represents the structure of a POST body for API requests.
 */
export type ApiPostBody = { [key: string]: unknown }

/**
 * Represents an error that occurs during an API call.
 */
class ApiError extends Error {
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
 * Resolves a relative API path to an absolute URL based on the base service URL.
 *
 * @param path - The relative path to the API endpoint.
 * @returns The full URL as a string, ensuring no duplicate or missing slashes.
 */
export const resolveUrl = (path: string): string => {
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
 * @template T - The expected type of the parsed JSON response.
 * @param response - The response object from the fetch call.
 * @returns A promise resolving to the parsed JSON response as type `T`.
 * @throws {ApiError} If the response status is not OK, with an error message extracted from the server response.
 */
export const parseResponseAndHandleError = async <T extends object | void>(
  response: Response,
): Promise<T> => {
  if (response.status === 204) {
    return Promise.resolve({} as T)
  } else if (response.ok) {
    return (await response.json()) as T
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { message } = (await response.json()) as Record<string, any>
    notifyError(message ?? 'Unknown error')
    throw new ApiError(message)
  }
}

/**
 * Checks if a given JWT token is expired.
 *
 * @param token - The JWT token as a string, or `undefined` if no token is available.
 * @returns `true` if the token is expired or invalid; `false` otherwise.
 */
export const isTokenExpired = (token: string | undefined): boolean => {
  if (!token) return true

  try {
    const decoded: { exp: number } = jwtDecode(token)
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch (error) {
    console.error('Error decoding token:', error)
    return true
  }
}

/**
 * Converts an object of query parameters into a URL query string.
 *
 * Filters out `undefined` keys and values, as well as empty string values.
 * Encodes each key-value pair for safe URL transmission.
 *
 * @param params - An object containing query parameters where keys are strings
 *                 and values can be strings, numbers, or undefined.
 * @returns A formatted query string starting with `?` if there are valid parameters,
 *          otherwise returns an empty string.
 */
export function parseQueryParams(
  params: Record<string, string | number | undefined>,
): string {
  const parsed = Object.entries(params)
    .filter(
      ([key, value]) =>
        key !== undefined &&
        value !== undefined &&
        !(typeof value === 'string' && value.trim().length === 0),
    )
    .map((components) =>
      (components as (string | number)[]).map(encodeURIComponent).join('='),
    )
    .join('&')

  return parsed.length ? `?${parsed}` : ''
}
