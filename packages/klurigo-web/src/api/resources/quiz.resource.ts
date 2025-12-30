import type {
  PaginatedQuizResponseDto,
  QuestionDto,
  QuizRequestDto,
  QuizResponseDto,
} from '@klurigo/common'

import type { ApiClientCore } from '../api-client-core'
import { parseQueryParams } from '../api.utils.ts'

/**
 * Side-effect hooks used by `createQuizResource`.
 *
 * The quiz resource performs API calls only and delegates user feedback (e.g. toast notifications)
 * to injected callbacks.
 */
export type QuizResourceDeps = {
  /**
   * Emits a success notification to the user.
   *
   * @param message - The user-facing message to display.
   */
  notifySuccess: (message: string) => void

  /**
   * Emits an error notification to the user.
   *
   * @param message - The user-facing message to display.
   */
  notifyError: (message: string) => void
}

/**
 * Quiz API wrapper.
 *
 * This module groups quiz-related HTTP calls behind a stable interface.
 * User feedback is emitted via injected callbacks to keep the resource stateless and testable.
 *
 * @param api - Shared API client core used for request execution.
 * @param deps - Side-effect callbacks for user notifications.
 * @returns An object containing quiz-related API functions.
 */
export const createQuizResource = (
  api: ApiClientCore,
  deps: QuizResourceDeps,
) => {
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
    api
      .apiGet<PaginatedQuizResponseDto>(
        `/profile/quizzes${parseQueryParams(options)}`,
      )
      .catch((error) => {
        deps.notifyError(
          'We couldn’t load your quizzes right now. Please try again.',
        )
        throw error
      })

  /**
   * Creates a new quiz with the specified request data.
   *
   * @param request - The request data for creating a new quiz.
   *
   * @returns A promise resolving to the created quiz details as a `QuizResponseDto`.
   */
  const createQuiz = (request: QuizRequestDto): Promise<QuizResponseDto> =>
    api
      .apiPost<QuizResponseDto>('/quizzes', request)
      .then((response) => {
        deps.notifySuccess(
          'Success! Your quiz has been created and is ready to go!',
        )
        return response
      })
      .catch((error) => {
        deps.notifyError('Quiz creation failed. Please try again.')
        throw error
      })

  /**
   * Retrieves the details of a specific quiz by its ID.
   *
   * @param quizId - The ID of the quiz to retrieve.
   *
   * @returns A promise resolving to the quiz details as a `QuizResponseDto`.
   */
  const getQuiz = (quizId: string): Promise<QuizResponseDto> =>
    api.apiGet<QuizResponseDto>(`/quizzes/${quizId}`).catch((error) => {
      deps.notifyError('We couldn’t load that quiz. Please try again.')
      throw error
    })

  /**
   * Retrieves a paginated list of public quizzes.
   *
   * @param options.search - Optional search term to filter quizzes by title.
   * @param options.limit - The maximum number of quizzes to retrieve per page.
   * @param options.offset - The number of quizzes to skip before starting retrieval.
   * @returns A promise resolving to public quizzes in a paginated format.
   */
  const getPublicQuizzes = (options: {
    search?: string
    limit: number
    offset: number
  }): Promise<PaginatedQuizResponseDto> =>
    api
      .apiGet<PaginatedQuizResponseDto>(`/quizzes${parseQueryParams(options)}`)
      .catch((error) => {
        deps.notifyError(
          'We couldn’t load public quizzes right now. Please try again.',
        )
        throw error
      })

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
    api
      .apiPut<QuizResponseDto>(`/quizzes/${quizId}`, request)
      .then((response) => {
        deps.notifySuccess(
          'Success! Your quiz has been saved and is ready to go!',
        )
        return response
      })
      .catch((error) => {
        deps.notifyError('Saving your quiz failed. Please try again.')
        throw error
      })

  /**
   * Deletes a quiz by its ID.
   *
   * @param quizId - The ID of the quiz to delete.
   *
   * @returns A promise that resolves when the quiz has been successfully deleted.
   */
  const deleteQuiz = (quizId: string): Promise<void> =>
    api
      .apiDelete<void>(`/quizzes/${quizId}`)
      .then(() => {
        deps.notifySuccess('Success! The quiz has been deleted successfully.')
      })
      .catch((error) => {
        deps.notifyError(
          'We couldn’t delete that quiz right now. Please try again.',
        )
        throw error
      })

  /**
   * Retrieves the list of questions for a specific quiz.
   *
   * @param quizId - The ID of the quiz to retrieve questions for.
   * @returns A promise that resolves to an array of quiz questions.
   */
  const getQuizQuestions = (quizId: string): Promise<QuestionDto[]> =>
    api.apiGet<QuestionDto[]>(`/quizzes/${quizId}/questions`).catch((error) => {
      deps.notifyError('We couldn’t load the quiz questions. Please try again.')
      throw error
    })

  return {
    getProfileQuizzes,
    createQuiz,
    getQuiz,
    getPublicQuizzes,
    updateQuiz,
    deleteQuiz,
    getQuizQuestions,
  }
}
