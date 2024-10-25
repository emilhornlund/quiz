import { CreateGameRequestDto, CreateGameResponseDto } from '@quiz/common'

import config from '../config.ts'

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export const useQuizService = () => {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiPost = <T extends object>(path: string, requestBody: any) =>
    fetch(resolveUrl(path), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }).then((response) => {
      if (response.ok) {
        return response.json() as T
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { message } = response.json() as Record<string, any>
        throw new ApiError(message)
      }
    })

  const createGame = (request: CreateGameRequestDto) =>
    apiPost<CreateGameResponseDto>('/games', request)

  return { createGame }
}
