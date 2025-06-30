import {
  AuthLoginRequestDto,
  AuthLoginResponseDto,
  AuthRefreshRequestDto,
  CreateGameResponseDto,
  CreateUserRequestDto,
  CreateUserResponseDto,
  FindGameResponseDto,
  GameResultDto,
  MediaUploadPhotoResponseDto,
  PaginatedGameHistoryDto,
  PaginatedMediaPhotoSearchDto,
  PaginatedQuizResponseDto,
  QuestionCorrectAnswerDto,
  QuestionDto,
  QuestionType,
  QuizRequestDto,
  QuizResponseDto,
  SubmitQuestionAnswerRequestDto,
  UpdateUserProfileRequestDto,
  UserProfileResponseDto,
} from '@quiz/common'

import { useAuthContext } from '../context/auth'
import { notifyError, notifySuccess } from '../utils/notification.ts'

import {
  ApiPostBody,
  isTokenExpired,
  parseQueryParams,
  parseResponseAndHandleError,
  resolveUrl,
} from './api-utils.ts'

/**
 * Hook for interacting with the Quiz service API.
 *
 * Automatically handles:
 * - CRUD for quizzes
 * - Game session actions
 * - Media uploads
 * - Authentication (including token refresh on expiry or 401)
 *
 * @returns An object containing the various API methods.
 */
export const useQuizServiceClient = () => {
  const { accessToken, refreshToken, setAuth } = useAuthContext()

  /**
   * Makes an HTTP request to the Quiz API, handling token expiry & retry.
   *
   * @template T - Expected response type
   * @param {'GET'|'POST'|'PUT'|'DELETE'} method - HTTP verb
   * @param {string} path - API endpoint (relative)
   * @param {ApiPostBody} [body] - Payload for POST/PUT/DELETE
   * @param {string} [overrideToken] - If provided, use this token instead of context
   * @returns {Promise<T>} - Parsed JSON response
   */
  const apiFetch = async <T extends object | void>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: ApiPostBody,
    overrideToken?: string,
  ): Promise<T> => {
    let token = overrideToken || accessToken

    // 1) Preemptively refresh expired accessToken (skip if we're already refreshing)
    if (
      !overrideToken &&
      isTokenExpired(accessToken) &&
      refreshToken &&
      path !== '/auth/refresh'
    ) {
      const refreshed = await refresh({ refreshToken })
      token = refreshed.accessToken
    }

    // Build headers; omit auth header on the refresh endpoint
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
    if (token && path !== '/auth/refresh') {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(resolveUrl(path), {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    })

    // 2) If 401 and we have a refreshToken (and not on the refresh path), try one refresh+retry
    if (response.status === 401 && refreshToken && path !== '/auth/refresh') {
      const refreshed = await refresh({ refreshToken })
      return apiFetch<T>(method, path, body, refreshed.accessToken)
    }

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
   * @param requestBody - The request body to be sent in the DELETE request.
   * @returns A promise resolving to the API response as type `T`.
   */
  const apiDelete = <T extends object | void>(
    path: string,
    requestBody?: ApiPostBody,
  ) => apiFetch<T>('DELETE', path, requestBody)

  /**
   * Sends a login request to the API and stores the returned authentication tokens.
   *
   * @param request - The login credentials containing email and password.
   *
   * @returns A promise that resolves to the login response with access and refresh tokens.
   */
  const login = (request: AuthLoginRequestDto): Promise<AuthLoginResponseDto> =>
    apiPost<AuthLoginResponseDto>('/auth/login', {
      email: request.email,
      password: request.password,
    }).then((loginAuthResponse) => {
      setAuth({
        accessToken: loginAuthResponse.accessToken,
        refreshToken: loginAuthResponse.refreshToken,
      })
      return loginAuthResponse
    })

  /**
   * Sends a refresh request to the API and stores the returned authentication tokens.
   *
   * @param request - The request containing the refresh token.
   *
   * @returns A promise that resolves to the login response with access and refresh tokens.
   */
  const refresh = (
    request: AuthRefreshRequestDto,
  ): Promise<AuthLoginResponseDto> =>
    apiPost<AuthLoginResponseDto>('/auth/refresh', request).then(
      (refreshed) => {
        setAuth({
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
        })
        return refreshed
      },
    )

  /**
   * Sends a registration request to the API to create a new user account.
   *
   * @param request - The user registration data including email, password, and optional names.
   *
   * @returns A promise that resolves to the newly created user's information.
   */
  const register = (
    request: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> =>
    apiPost<CreateUserResponseDto>('/users', {
      email: request.email,
      password: request.password,
      givenName: request.givenName,
      familyName: request.familyName,
      defaultNickname: request.defaultNickname,
    }).then((response) => {
      notifySuccess('Welcome aboard! Your account is ready to roll')
      return response
    })

  /**
   * Retrieves information about the current user.
   *
   * @returns A promise resolving to the user information.
   */
  const getUserProfile = (): Promise<UserProfileResponseDto> =>
    apiGet<UserProfileResponseDto>('/profile/user')

  /**
   * Updates the currently authenticated player's profile.
   *
   * @param request - The user update data including email and optional names.
   *
   * @returns A promise resolving to the updated user information.
   */
  const updateUserProfile = (
    request: UpdateUserProfileRequestDto,
  ): Promise<UserProfileResponseDto> =>
    apiPut<UserProfileResponseDto>('/profile/user', {
      email: request.email,
      givenName: request.givenName,
      familyName: request.familyName,
      defaultNickname: request.defaultNickname,
    }).then((response) => {
      notifySuccess(
        'Nice! Your new profile is locked in. Get ready to quiz in style!',
      )
      return response
    })

  /**
   * Retrieves the quizzes associated with the current user.
   *
   * @param options.limit - The maximum number of quizzes to retrieve per page.
   * @param options.offset - The number of quizzes to skip before starting retrieval.
   *
   * @returns A promise resolving to the quizzes in a paginated format as a `PaginatedQuizResponseDto`.
   */
  const getProfileQuizzes = (options: {
    limit: number
    offset: number
  }): Promise<PaginatedQuizResponseDto> =>
    apiGet<PaginatedQuizResponseDto>(
      `/profile/quizzes${parseQueryParams(options)}`,
    )

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
   * Retrieves a paginated list of public quizzes.
   *
   * @param options.searchTerm - A search term to filter quizzes by their titles.
   * @param options.limit - The maximum number of quizzes to retrieve per page.
   * @param options.offset - The number of quizzes to skip before starting retrieval.
   */
  const getPublicQuizzes = (options: {
    search?: string
    limit: number
    offset: number
  }): Promise<PaginatedQuizResponseDto> =>
    apiGet<PaginatedQuizResponseDto>(`/quizzes${parseQueryParams(options)}`)

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
   * Leaves an existing game using the provided game ID and player ID.
   *
   * @param gameID - The ID of the game to join.
   * @param playerID - The ID of the player to remove.
   *
   * @returns A Promise that resolves when the player is successfully removed from the game.
   */
  const leaveGame = (gameID: string, playerID: string): Promise<void> =>
    apiDelete<void>(`/games/${gameID}/players/${playerID}`)

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

  /**
   * Adds a correct answer to the current task in the specified game.
   *
   * @param gameID - The ID of the game where the correct answer should be added.
   * @param answer - The correct answer data to add to the current task.
   * @returns A promise that resolves when the correct answer has been successfully added.
   */
  const addCorrectAnswer = (
    gameID: string,
    answer: QuestionCorrectAnswerDto,
  ): Promise<void> =>
    apiPost(`/games/${gameID}/tasks/current/correct_answers`, answer).then(
      () => {},
    )

  /**
   * Deletes a correct answer from the current task in the specified game.
   *
   * @param gameID - The ID of the game where the correct answer should be deleted.
   * @param answer - The correct answer data to delete from the current task.
   * @returns A promise that resolves when the correct answer has been successfully deleted.
   */
  const deleteCorrectAnswer = (
    gameID: string,
    answer: QuestionCorrectAnswerDto,
  ): Promise<void> =>
    apiDelete(`/games/${gameID}/tasks/current/correct_answers`, answer).then(
      () => {},
    )

  /**
   * Retrieves the game history associated with the current player.
   *
   * @param options.limit - The maximum number of games to retrieve per page.
   * @param options.offset - The number of games to skip before starting retrieval.
   *
   * @returns A promise that resolves to a paginated list of past games.
   */
  const getProfileGames = (options: {
    limit: number
    offset: number
  }): Promise<PaginatedGameHistoryDto> =>
    apiGet<PaginatedGameHistoryDto>(
      `/profile/games${parseQueryParams(options)}`,
    )

  /**
   * Fetches the results for a completed game by its ID.
   *
   * @param gameID - The unique identifier of the game to retrieve results for.
   *
   * @returns A promise that resolves with the game's result data.
   */
  const getGameResults = (gameID: string) =>
    apiGet<GameResultDto>(`/games/${gameID}/results`)

  /**
   * Searches for media photos based on an optional search term.
   *
   * @param search - An optional search string to filter photo results.
   *
   * @returns A promise that resolves to a paginated list of matching media photos.
   */
  const searchPhotos = (
    search?: string,
  ): Promise<PaginatedMediaPhotoSearchDto> =>
    apiGet<PaginatedMediaPhotoSearchDto>(
      `/media/photos?search=${search}&offset=0&limit=50`,
    )

  /**
   * Uploads an image file with progress tracking.
   *
   * @param file - The image file to upload.
   * @param onProgress - Callback that receives upload progress percentage (0–1).
   *
   * @returns A promise that resolves with the uploaded image response.
   */
  const uploadImage = async (
    file: File,
    onProgress: (progress: number) => void,
  ): Promise<MediaUploadPhotoResponseDto> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()
      xhr.responseType = 'json'

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          onProgress(progress)
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          notifySuccess('Upload successful! Your photo has been uploaded.')
          resolve(xhr.response as MediaUploadPhotoResponseDto)
        } else {
          notifyError(`Upload failed with status ${xhr.status}`)
          reject(`Upload failed with status ${xhr.status}`)
        }
      }

      xhr.onerror = () => {
        notifyError('Upload failed due to a network error.')
        reject('Upload failed due to a network error')
      }

      xhr.open('POST', resolveUrl('/media/uploads/photos'))
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
      xhr.send(formData)
    })
  }

  /**
   * Deletes an uploaded photo by its ID.
   *
   * @param photoId - The ID of the uploaded photo to delete.
   *
   * @returns A promise that resolves when the uploaded photo has been successfully deleted.
   */
  const deleteUploadedPhoto = (photoId: string): Promise<void> =>
    apiDelete<void>(`/media/uploads/photos/${photoId}`)

  return {
    login,
    register,
    getUserProfile,
    updateUserProfile,
    getProfileQuizzes,
    createQuiz,
    getQuiz,
    getPublicQuizzes,
    updateQuiz,
    deleteQuiz,
    getQuizQuestions,
    findGame,
    createGame,
    joinGame,
    leaveGame,
    completeTask,
    submitQuestionAnswer,
    addCorrectAnswer,
    deleteCorrectAnswer,
    getProfileGames,
    getGameResults,
    searchPhotos,
    uploadImage,
    deleteUploadedPhoto,
  }
}
