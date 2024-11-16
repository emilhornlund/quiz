import {
  CreateGameRequestDto,
  FindGameResponseDto,
  GameAuthResponseDto,
  QuestionType,
  SubmitQuestionAnswerRequestDto,
} from '@quiz/common'
import { Bounce, toast } from 'react-toastify'

import config from '../config.ts'

type ApiPostBody = { [key: string]: unknown }

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

  const apiGet = <T extends object>(path: string, token?: string) =>
    fetch(resolveUrl(path), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }).then(parseResponseAndHandleError<T>)

  const apiPost = <T extends object>(
    path: string,
    requestBody: ApiPostBody,
    token?: string,
  ) =>
    fetch(resolveUrl(path), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(requestBody),
    }).then(parseResponseAndHandleError<T>)

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

  /**
   *
   * @param gameID
   * @param token
   * @param submitQuestionAnswerRequest
   */
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

  return { createGame, findGame, joinGame, completeTask, submitQuestionAnswer }
}
