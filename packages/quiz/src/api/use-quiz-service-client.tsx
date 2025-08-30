import {
  AuthGameRequestDto,
  AuthGoogleExchangeRequestDto,
  AuthLoginRequestDto,
  AuthPasswordChangeRequestDto,
  AuthPasswordForgotRequestDto,
  AuthPasswordResetRequestDto,
  AuthRefreshRequestDto,
  AuthResponseDto,
  AuthRevokeRequestDto,
  CreateGameResponseDto,
  CreateUserRequestDto,
  CreateUserResponseDto,
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
  TokenScope,
  TokenType,
  UpdateGoogleUserProfileRequestDto,
  UpdateLocalUserProfileRequestDto,
  UserMigrationRequestDto,
  UserProfileResponseDto,
} from '@quiz/common'
import { useCallback } from 'react'
import { useLocalStorage } from 'usehooks-ts'

import { useAuthContext } from '../context/auth'
import { useMigrationContext } from '../context/migration'
import { useUserContext } from '../context/user'
import { notifyError, notifySuccess } from '../utils/notification.ts'

import {
  ApiPostBody,
  isTokenExpired,
  parseQueryParams,
  parseResponseAndHandleError,
  resolveUrl,
} from './api-utils.ts'

/**
 * Options that control how authenticated requests are performed.
 */
type FetchOptions = {
  /** Which token scope to use for auth (defaults to `TokenScope.User`). */
  scope?: TokenScope
  /** Access token to use for this call (overrides context token if provided). */
  token?: string
  /** Auto-refresh access token on expiry/401 (defaults to `true`). */
  refresh?: boolean
}

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
  const { user, game, setTokenPair } = useAuthContext()

  const { fetchCurrentUser, clearCurrentUser } = useUserContext()

  const { completeMigration } = useMigrationContext()

  const [migrationToken] = useLocalStorage<string | undefined>(
    'migrationToken',
    undefined,
  )

  /**
   * Retrieves the token string for the specified scope and token type
   * from the authentication context.
   *
   * @param scope - The TokenScope (User or Game) whose token to fetch.
   * @param type - The TokenType (Access or Refresh) to retrieve.
   * @returns The JWT/opaque token string, or `undefined` if not present.
   */
  const getToken = useCallback(
    (scope: TokenScope, type: TokenType): string | undefined => {
      switch (scope) {
        case TokenScope.User:
          return user?.[type].token
        case TokenScope.Game:
          return game?.[type].token
      }
    },
    [user, game],
  )

  /**
   * Makes an HTTP request to the Quiz API, handling token expiry & retry.
   *
   * @template T - Expected response type
   * @param method - HTTP verb
   * @param path - API endpoint (relative)
   * @param body - Payload for GET/POST/PUT/PATCH/DELETE
   * @param options - Per-call overrides (`scope`, `token`, `refresh`).
   * @returns {Promise<T>} - Parsed JSON response
   */
  const apiFetch = async <T extends object | void>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body: ApiPostBody | undefined,
    options: FetchOptions = {},
  ): Promise<T> => {
    const overrideToken = options.token
    const scope = options.scope ?? TokenScope.User
    const shouldRefresh = options.refresh ?? true

    let accessToken = overrideToken || getToken(scope, TokenType.Access)
    let refreshToken = getToken(scope, TokenType.Refresh)

    // 1) Preemptively refresh expired accessToken (skip if we're already refreshing)
    if (
      !overrideToken &&
      isTokenExpired(accessToken) &&
      refreshToken &&
      path !== '/auth/refresh' &&
      shouldRefresh
    ) {
      const refreshed = await refresh(scope, { refreshToken })
      accessToken = refreshed.accessToken
      refreshToken = refreshed.refreshToken
    }

    // Build headers; omit auth header on the refresh endpoint
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
    if (accessToken && path !== '/auth/refresh') {
      headers.Authorization = `Bearer ${accessToken}`
    }

    const response = await fetch(resolveUrl(path), {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    })

    // 2) If 401 and we have a refreshToken (and not on the refresh path), try one refresh+retry
    if (
      response.status === 401 &&
      refreshToken &&
      path !== '/auth/refresh' &&
      shouldRefresh
    ) {
      const refreshed = await refresh(scope, { refreshToken })
      return apiFetch<T>(method, path, body, {
        scope,
        token: refreshed.accessToken,
      })
    }

    return parseResponseAndHandleError<T>(response)
  }

  /**
   * Makes a GET request to the specified API endpoint.
   *
   * @template T - The expected type of the API response.
   * @param path - The relative path to the API endpoint.
   * @param options - Per-call overrides (`scope`, `token`, `refresh`).
   * @returns A promise resolving to the API response as type `T`.
   */
  const apiGet = <T extends object | void>(
    path: string,
    options: FetchOptions = {},
  ) => apiFetch<T>('GET', path, undefined, options)

  /**
   * Makes a POST request to the specified API endpoint.
   *
   * @template T - The expected type of the API response.
   * @param path - The relative path to the API endpoint.
   * @param requestBody - The request body to be sent in the POST request.
   * @param options - Per-call overrides (`scope`, `token`, `refresh`).
   * @returns A promise resolving to the API response as type `T`.
   */
  const apiPost = <T extends object | void>(
    path: string,
    requestBody: ApiPostBody,
    options: FetchOptions = {},
  ) => apiFetch<T>('POST', path, requestBody, options)

  /**
   * Makes a PUT request to the specified API endpoint.
   *
   * @template T - The expected type of the API response.
   * @param path - The relative path to the API endpoint.
   * @param requestBody - The request body to be sent in the PUT request.
   * @param options - Per-call overrides (`scope`, `token`, `refresh`).
   * @returns A promise resolving to the API response as type `T`.
   */
  const apiPut = <T extends object | void>(
    path: string,
    requestBody: ApiPostBody,
    options: FetchOptions = {},
  ) => apiFetch<T>('PUT', path, requestBody, options)

  /**
   * Makes a PATCH request to the specified API endpoint.
   *
   * @template T - The expected type of the API response.
   * @param path - The relative path to the API endpoint.
   * @param requestBody - The request body to be sent in the PATCH request.
   * @param options - Per-call overrides (`scope`, `token`, `refresh`).
   * @returns A promise resolving to the API response as type `T`.
   */
  const apiPatch = <T extends object | void>(
    path: string,
    requestBody: ApiPostBody,
    options: FetchOptions = {},
  ) => apiFetch<T>('PATCH', path, requestBody, options)

  /**
   * Makes a DELETE request to the specified API endpoint.
   *
   * @template T - The expected type of the API response.
   * @param path - The relative path to the API endpoint.
   * @param requestBody - The request body to be sent in the DELETE request.
   * @param options - Per-call overrides (`scope`, `token`, `refresh`).
   * @returns A promise resolving to the API response as type `T`.
   */
  const apiDelete = <T extends object | void>(
    path: string,
    requestBody?: ApiPostBody,
    options: FetchOptions = {},
  ) => apiFetch<T>('DELETE', path, requestBody, options)

  /**
   * Sends a login request to the API and stores the returned authentication tokens.
   *
   * @param request - The login credentials containing email and password.
   * @returns A promise that resolves to the login response with access and refresh tokens.
   */
  const login = (request: AuthLoginRequestDto): Promise<AuthResponseDto> =>
    apiPost<AuthResponseDto>(
      `/auth/login${parseQueryParams({ ...(migrationToken ? { migrationToken } : {}) })}`,
      {
        email: request.email,
        password: request.password,
      },
    ).then(async (res) => {
      setTokenPair(TokenScope.User, res.accessToken, res.refreshToken)
      if (migrationToken) {
        completeMigration()
      }
      await fetchCurrentUser(res.accessToken)
      return res
    })

  /**
   * Exchanges a Google OAuth authorization code and PKCE verifier
   * for an authentication response containing access and refresh tokens.
   *
   * @param request - An object with `code` (the Google OAuth code) and `codeVerifier` (the matching PKCE verifier).
   * @returns A promise that resolves to the login response with access and refresh tokens.
   */
  const googleExchangeCode = (
    request: AuthGoogleExchangeRequestDto,
  ): Promise<AuthResponseDto> =>
    apiPost<AuthResponseDto>(
      `/auth/google/exchange${parseQueryParams({ ...(migrationToken ? { migrationToken } : {}) })}`,
      request,
    ).then(async (res) => {
      setTokenPair(TokenScope.User, res.accessToken, res.refreshToken)
      if (migrationToken) {
        completeMigration()
      }
      await fetchCurrentUser(res.accessToken)
      return res
    })

  /**
   * Sends a game authentication request to the API and stores the returned authentication tokens.
   *
   * @param request - The game authentication credentials containing the necessary game identifier.
   * @returns A promise that resolves to the authentication response with access and refresh tokens.
   */
  const authenticateGame = (
    request: AuthGameRequestDto,
  ): Promise<AuthResponseDto> =>
    apiPost<AuthResponseDto>(`/auth/game`, request, { refresh: false }).then(
      (res) => {
        setTokenPair(TokenScope.Game, res.accessToken, res.refreshToken)
        return res
      },
    )

  /**
   * Sends a refresh request to the API and stores the returned authentication tokens.
   *
   * @param scope - The TokenScope to use when authorizing this request (User or Game).
   * @param request - The request containing the refresh token.
   * @returns A promise that resolves to the login response with access and refresh tokens.
   */
  const refresh = (
    scope: TokenScope,
    request: AuthRefreshRequestDto,
  ): Promise<AuthResponseDto> =>
    apiPost<AuthResponseDto>('/auth/refresh', request).then(async (res) => {
      setTokenPair(scope, res.accessToken, res.refreshToken)
      if (scope === TokenScope.User) {
        await fetchCurrentUser(res.accessToken)
      }
      return res
    })

  /**
   * Revokes the specified authentication token.
   *
   * Sends a request to invalidate the given access or refresh token on the server,
   * effectively logging out the user and preventing further use of that token.
   *
   * @param request - An object containing the token to be revoked.
   * @param scope - The TokenScope (User or Game) whose token to revoke.
   * @returns A promise that resolves when the token has been successfully revoked.
   */
  const revoke = (
    request: AuthRevokeRequestDto,
    scope: TokenScope,
  ): Promise<void> =>
    apiPost<void>('/auth/revoke', request).then(() => {
      if (scope === TokenScope.User) {
        clearCurrentUser()
      }
    })

  /**
   * Verifies a user’s email address by sending the provided token to the backend.
   *
   * Sends a POST request to `/auth/email/verify` with the given token in a user scope.
   *
   * @param token – The one-time email verification token that was emailed to the user.
   * @returns A promise which:
   *   - **resolves** to `void` if the server confirms the email successfully,
   *   - **rejects** with an error if the verification fails or the token is invalid.
   */
  const verifyEmail = (token: string): Promise<void> =>
    apiPost<void>(
      '/auth/email/verify',
      {},
      { scope: TokenScope.User, token },
    ).then(() => {})

  /**
   * Resend a verification email to the current user.
   *
   * @returns {Promise<void>} Resolves once the email has been sent (or rejects on failure).
   */
  const resendVerificationEmail = (): Promise<void> =>
    apiPost<void>('/auth/email/resend_verification', {})
      .then((response) => {
        notifySuccess(
          'Hooray! A fresh verification email is on its way—check your inbox!',
        )
        return response
      })
      .catch((error) => {
        notifyError(
          'Whoops! We couldn’t resend your verification email. Please try again.',
        )
        throw error
      })

  /**
   * Sends a password reset email to the user.
   *
   * @param request - An object containing the user’s email.
   * @returns A promise that resolves when the reset email has been successfully sent.
   */
  const sendPasswordResetEmail = (
    request: AuthPasswordForgotRequestDto,
  ): Promise<void> =>
    apiPost<void>('/auth/password/forgot', request).then((response) => {
      notifySuccess(
        'We’ve flung a reset link to your inbox. Didn’t see it? Sneak a peek in your spam folder.',
      )
      return response
    })

  /**
   * Resets the user’s password using the provided token.
   *
   * @param request - An object containing the new password details.
   * @param token   - The password reset token extracted from the reset link.
   * @returns A promise that resolves when the password has been successfully updated.
   */
  const resetPassword = (
    request: AuthPasswordResetRequestDto,
    token: string,
  ): Promise<void> =>
    apiPatch<void>('/auth/password/reset', request, {
      scope: TokenScope.User,
      token,
    }).then((response) => {
      notifySuccess(
        'All Set! Your new password is locked and loaded. Welcome back!',
      )
      return response
    })

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
    apiPost<CreateUserResponseDto>(
      `/users${parseQueryParams({ ...(migrationToken ? { migrationToken } : {}) })}`,
      {
        email: request.email,
        password: request.password,
        givenName: request.givenName,
        familyName: request.familyName,
        defaultNickname: request.defaultNickname,
      },
    ).then((response) => {
      if (migrationToken) {
        completeMigration()
      }
      notifySuccess('Welcome aboard! Your account is ready to roll')
      return response
    })

  /**
   * Migrates a legacy anonymous player profile to the current user account.
   *
   * Sends the migration token to the backend, linking the old profile data
   * with the authenticated user.
   *
   * @param request - The migration request containing the 43-character token.
   * @returns A promise that resolves when the migration is successful.
   */
  const migrateUser = (request: UserMigrationRequestDto): Promise<void> =>
    apiPost<void>('/migration/user', request).then(() => {
      notifySuccess('Your past self has officially joined the party!')
    })

  /**
   * Retrieves information about the current user.
   *
   * @param token - If provided, use this token instead of context.
   *
   * @returns A promise resolving to the user information.
   */
  const getUserProfile = (token?: string): Promise<UserProfileResponseDto> =>
    apiGet<UserProfileResponseDto>('/profile/user', {
      scope: TokenScope.User,
      token,
    })

  /**
   * Updates the currently authenticated user's profile.
   *
   * @param request - The user update data including email and optional names.
   *
   * @returns A promise resolving to the updated user information.
   */
  const updateUserProfile = (
    request:
      | UpdateLocalUserProfileRequestDto
      | UpdateGoogleUserProfileRequestDto,
  ): Promise<UserProfileResponseDto> =>
    apiPut<UserProfileResponseDto>('/profile/user', request).then(
      (response) => {
        notifySuccess(
          'Nice! Your new profile is locked in. Get ready to quiz in style!',
        )
        return response
      },
    )

  /**
   * Updates the currently authenticated user's password.
   *
   * @param request - The password data including the old and new passwords.
   *
   * @returns A promise that resolves when the password has been successfully updated.
   */
  const updateUserPassword = (
    request: AuthPasswordChangeRequestDto,
  ): Promise<void> =>
    apiPatch('/auth/password', request)
      .then(() => {})
      .then((response) => {
        notifySuccess('Done and dusted! Your password’s been refreshed.')
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
    apiPost<void>(
      `/games/${gameID}/players`,
      { nickname },
      { scope: TokenScope.Game },
    )

  /**
   * Leaves an existing game using the provided game ID and player ID.
   *
   * @param gameID - The ID of the game to join.
   * @param playerID - The ID of the player to remove.
   *
   * @returns A Promise that resolves when the player is successfully removed from the game.
   */
  const leaveGame = (gameID: string, playerID: string): Promise<void> =>
    apiDelete<void>(`/games/${gameID}/players/${playerID}`, undefined, {
      scope: TokenScope.Game,
    })

  /**
   * Marks the current task in the game as completed.
   *
   * @param gameID - The ID of the game whose current task should be completed.
   *
   * @returns A promise that resolves when the task has been successfully completed.
   */
  const completeTask = (gameID: string) =>
    apiPost(
      `/games/${gameID}/tasks/current/complete`,
      {},
      { scope: TokenScope.Game },
    ).then(() => {})

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
    await apiPost(`/games/${gameID}/answers`, requestBody, {
      scope: TokenScope.Game,
    })
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
    apiPost(`/games/${gameID}/tasks/current/correct_answers`, answer, {
      scope: TokenScope.Game,
    }).then(() => {})

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
    apiDelete(`/games/${gameID}/tasks/current/correct_answers`, answer, {
      scope: TokenScope.Game,
    }).then(() => {})

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
      xhr.setRequestHeader('Authorization', `Bearer ${user?.ACCESS.token}`)
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
    googleExchangeCode,
    authenticateGame,
    refresh,
    revoke,
    verifyEmail,
    resendVerificationEmail,
    sendPasswordResetEmail,
    resetPassword,
    register,
    migrateUser,
    getUserProfile,
    updateUserProfile,
    updateUserPassword,
    getProfileQuizzes,
    createQuiz,
    getQuiz,
    getPublicQuizzes,
    updateQuiz,
    deleteQuiz,
    getQuizQuestions,
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
