import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiClientCore } from '../api-client-core'

import { createQuizResource } from './quiz.resource'
import type { QuizResourceDeps } from './quiz.resource'

vi.mock('../api.utils', () => ({
  parseQueryParams: vi.fn((params: unknown) => {
    if (typeof params === 'object' && params) {
      const p = params as Record<string, unknown>
      if (p.search !== undefined) return '?search=cat&limit=10&offset=20'
      return '?limit=10&offset=20'
    }
    return ''
  }),
}))

const makeApi = (): {
  api: ApiClientCore
  apiGet: ReturnType<typeof vi.fn>
  apiPost: ReturnType<typeof vi.fn>
  apiPut: ReturnType<typeof vi.fn>
  apiDelete: ReturnType<typeof vi.fn>
} => {
  const apiGet = vi.fn()
  const apiPost = vi.fn()
  const apiPut = vi.fn()
  const apiDelete = vi.fn()

  const api = {
    apiFetch: vi.fn(),
    apiGet,
    apiPost,
    apiPut,
    apiPatch: vi.fn(),
    apiDelete,
  } as unknown as ApiClientCore

  return { api, apiGet, apiPost, apiPut, apiDelete }
}

const makeDeps = (overrides?: Partial<QuizResourceDeps>) => {
  const deps: QuizResourceDeps = {
    notifySuccess: vi.fn(),
    notifyError: vi.fn(),
    ...overrides,
  }
  return deps
}

describe('createQuizResource', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getProfileQuizzes calls apiGet with query params and returns response', async () => {
    const { api, apiGet } = makeApi()
    const deps = makeDeps()
    const quiz = createQuizResource(api, deps)

    const res = { items: [], limit: 10, offset: 20, total: 0 }
    apiGet.mockResolvedValue(res)

    await expect(
      quiz.getProfileQuizzes({ limit: 10, offset: 20 }),
    ).resolves.toBe(res)
    expect(apiGet).toHaveBeenCalledWith('/profile/quizzes?limit=10&offset=20')
    expect(deps.notifyError).not.toHaveBeenCalled()
  })

  it('getProfileQuizzes notifies error and rethrows on failure', async () => {
    const { api, apiGet } = makeApi()
    const deps = makeDeps()
    const quiz = createQuizResource(api, deps)

    const err = new Error('boom')
    apiGet.mockRejectedValue(err)

    await expect(
      quiz.getProfileQuizzes({ limit: 10, offset: 20 }),
    ).rejects.toBe(err)
    expect(deps.notifyError).toHaveBeenCalledWith(
      'We couldn’t load your quizzes right now. Please try again.',
    )
  })

  it('createQuiz posts request, notifies success, and returns response', async () => {
    const { api, apiPost } = makeApi()
    const deps = makeDeps()
    const quiz = createQuizResource(api, deps)

    const request = {
      title: 'Quiz 1',
    } as unknown as import('@klurigo/common').QuizRequestDto
    const response = {
      id: 'q1',
    } as unknown as import('@klurigo/common').QuizResponseDto

    apiPost.mockResolvedValue(response)

    await expect(quiz.createQuiz(request)).resolves.toBe(response)

    expect(apiPost).toHaveBeenCalledWith('/quizzes', request)
    expect(deps.notifySuccess).toHaveBeenCalledWith(
      'Success! Your quiz has been created and is ready to go!',
    )
    expect(deps.notifyError).not.toHaveBeenCalled()
  })

  it('createQuiz notifies error and rethrows on failure', async () => {
    const { api, apiPost } = makeApi()
    const deps = makeDeps()
    const quiz = createQuizResource(api, deps)

    const request = {
      title: 'Quiz 1',
    } as unknown as import('@klurigo/common').QuizRequestDto
    const err = new Error('nope')
    apiPost.mockRejectedValue(err)

    await expect(quiz.createQuiz(request)).rejects.toBe(err)
    expect(deps.notifyError).toHaveBeenCalledWith(
      'Quiz creation failed. Please try again.',
    )
    expect(deps.notifySuccess).not.toHaveBeenCalled()
  })

  it('getQuiz calls apiGet and returns response', async () => {
    const { api, apiGet } = makeApi()
    const deps = makeDeps()
    const quiz = createQuizResource(api, deps)

    const response = {
      id: 'q1',
    } as unknown as import('@klurigo/common').QuizResponseDto
    apiGet.mockResolvedValue(response)

    await expect(quiz.getQuiz('q1')).resolves.toBe(response)
    expect(apiGet).toHaveBeenCalledWith('/quizzes/q1')
  })

  it('getQuiz notifies error and rethrows on failure', async () => {
    const { api, apiGet } = makeApi()
    const deps = makeDeps()
    const quiz = createQuizResource(api, deps)

    const err = new Error('fail')
    apiGet.mockRejectedValue(err)

    await expect(quiz.getQuiz('q1')).rejects.toBe(err)
    expect(deps.notifyError).toHaveBeenCalledWith(
      'We couldn’t load that quiz. Please try again.',
    )
  })

  it('getPublicQuizzes calls apiGet with query params and returns response', async () => {
    const { api, apiGet } = makeApi()
    const deps = makeDeps()
    const quiz = createQuizResource(api, deps)

    const res = { items: [], limit: 10, offset: 20, total: 0 }
    apiGet.mockResolvedValue(res)

    await expect(
      quiz.getPublicQuizzes({ search: 'cat', limit: 10, offset: 20 }),
    ).resolves.toBe(res)

    expect(apiGet).toHaveBeenCalledWith(
      '/quizzes?search=cat&limit=10&offset=20',
    )
  })

  it('getPublicQuizzes notifies error and rethrows on failure', async () => {
    const { api, apiGet } = makeApi()
    const deps = makeDeps()
    const quiz = createQuizResource(api, deps)

    const err = new Error('fail')
    apiGet.mockRejectedValue(err)

    await expect(
      quiz.getPublicQuizzes({ search: 'cat', limit: 10, offset: 20 }),
    ).rejects.toBe(err)

    expect(deps.notifyError).toHaveBeenCalledWith(
      'We couldn’t load public quizzes right now. Please try again.',
    )
  })

  it('updateQuiz calls apiPut, notifies success, and returns response', async () => {
    const { api, apiPut } = makeApi()
    const deps = makeDeps()
    const quiz = createQuizResource(api, deps)

    const request = {
      title: 'Updated',
    } as unknown as import('@klurigo/common').QuizRequestDto
    const response = {
      id: 'q1',
    } as unknown as import('@klurigo/common').QuizResponseDto
    apiPut.mockResolvedValue(response)

    await expect(quiz.updateQuiz('q1', request)).resolves.toBe(response)

    expect(apiPut).toHaveBeenCalledWith('/quizzes/q1', request)
    expect(deps.notifySuccess).toHaveBeenCalledWith(
      'Success! Your quiz has been saved and is ready to go!',
    )
    expect(deps.notifyError).not.toHaveBeenCalled()
  })

  it('updateQuiz notifies error and rethrows on failure', async () => {
    const { api, apiPut } = makeApi()
    const deps = makeDeps()
    const quiz = createQuizResource(api, deps)

    const request = {
      title: 'Updated',
    } as unknown as import('@klurigo/common').QuizRequestDto
    const err = new Error('fail')
    apiPut.mockRejectedValue(err)

    await expect(quiz.updateQuiz('q1', request)).rejects.toBe(err)
    expect(deps.notifyError).toHaveBeenCalledWith(
      'Saving your quiz failed. Please try again.',
    )
    expect(deps.notifySuccess).not.toHaveBeenCalled()
  })

  it('deleteQuiz calls apiDelete and notifies success', async () => {
    const { api, apiDelete } = makeApi()
    const deps = makeDeps()
    const quiz = createQuizResource(api, deps)

    apiDelete.mockResolvedValue(undefined)

    await expect(quiz.deleteQuiz('q1')).resolves.toBeUndefined()
    expect(apiDelete).toHaveBeenCalledWith('/quizzes/q1')
    expect(deps.notifySuccess).toHaveBeenCalledWith(
      'Success! The quiz has been deleted successfully.',
    )
    expect(deps.notifyError).not.toHaveBeenCalled()
  })

  it('deleteQuiz notifies error and rethrows on failure', async () => {
    const { api, apiDelete } = makeApi()
    const deps = makeDeps()
    const quiz = createQuizResource(api, deps)

    const err = new Error('fail')
    apiDelete.mockRejectedValue(err)

    await expect(quiz.deleteQuiz('q1')).rejects.toBe(err)
    expect(deps.notifyError).toHaveBeenCalledWith(
      'We couldn’t delete that quiz right now. Please try again.',
    )
    expect(deps.notifySuccess).not.toHaveBeenCalled()
  })

  it('getQuizQuestions calls apiGet and returns response', async () => {
    const { api, apiGet } = makeApi()
    const deps = makeDeps()
    const quiz = createQuizResource(api, deps)

    const questions = [
      { id: 'qq1' },
    ] as unknown as import('@klurigo/common').QuestionDto[]
    apiGet.mockResolvedValue(questions)

    await expect(quiz.getQuizQuestions('q1')).resolves.toBe(questions)
    expect(apiGet).toHaveBeenCalledWith('/quizzes/q1/questions')
  })

  it('getQuizQuestions notifies error and rethrows on failure', async () => {
    const { api, apiGet } = makeApi()
    const deps = makeDeps()
    const quiz = createQuizResource(api, deps)

    const err = new Error('fail')
    apiGet.mockRejectedValue(err)

    await expect(quiz.getQuizQuestions('q1')).rejects.toBe(err)
    expect(deps.notifyError).toHaveBeenCalledWith(
      'We couldn’t load the quiz questions. Please try again.',
    )
  })
})
