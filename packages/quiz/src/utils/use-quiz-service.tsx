import {
  CreateGameRequestDto,
  CreateGameResponseDto,
  FindGameResponseDto,
  JoinGameResponseDto,
} from '@quiz/common'
import { Bounce, toast } from 'react-toastify'

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

  const parseResponseAndHandleError = async <T extends object>(
    response: Response,
  ): Promise<T> => {
    if (response.ok) {
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

  const apiGet = <T extends object>(path: string) =>
    fetch(resolveUrl(path), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then(parseResponseAndHandleError<T>)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiPost = <T extends object>(path: string, requestBody: any) =>
    fetch(resolveUrl(path), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }).then(parseResponseAndHandleError<T>)

  const createGame = (
    request: CreateGameRequestDto,
  ): Promise<CreateGameResponseDto> =>
    apiPost<CreateGameResponseDto>('/games', request)

  const findGame = (gamePIN: string): Promise<FindGameResponseDto> =>
    apiGet<FindGameResponseDto>(`/games?gamePIN=${gamePIN}`)

  const joinGame = (
    gameID: string,
    nickname: string,
  ): Promise<JoinGameResponseDto> =>
    apiPost<JoinGameResponseDto>(`/games/${gameID}/players`, { nickname })

  return { createGame, findGame, joinGame }
}
