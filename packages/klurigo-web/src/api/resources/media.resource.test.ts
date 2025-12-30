import { TokenScope, TokenType } from '@klurigo/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiClientCore } from '../api-client-core'

import { createMediaResource } from './media.resource'
import type { MediaResourceDeps } from './media.resource'

vi.mock('../api.utils', () => ({
  parseQueryParams: vi.fn(() => '?search=cat&offset=0&limit=50'),
  resolveUrl: vi.fn((path: string) => `https://example.test${path}`),
}))

const makeApi = (): {
  api: ApiClientCore
  apiGet: ReturnType<typeof vi.fn>
  apiDelete: ReturnType<typeof vi.fn>
} => {
  const apiGet = vi.fn()
  const apiDelete = vi.fn()

  const api = {
    apiFetch: vi.fn(),
    apiGet,
    apiPost: vi.fn(),
    apiPut: vi.fn(),
    apiPatch: vi.fn(),
    apiDelete,
  } as unknown as ApiClientCore

  return { api, apiGet, apiDelete }
}

const makeDeps = (overrides?: Partial<MediaResourceDeps>) => {
  const deps: MediaResourceDeps = {
    getToken: vi.fn(() => undefined),
    notifySuccess: vi.fn(),
    notifyError: vi.fn(),
    ...overrides,
  }

  return deps
}

type FakeProgressEvent = {
  lengthComputable: boolean
  loaded: number
  total: number
}

class FakeXMLHttpRequest {
  static lastInstance: FakeXMLHttpRequest | undefined

  responseType: XMLHttpRequestResponseType = ''
  response: unknown = undefined
  status = 0

  upload = {
    onprogress: undefined as ((event: FakeProgressEvent) => void) | undefined,
  }

  onload: (() => void) | undefined
  onerror: (() => void) | undefined

  open = vi.fn()
  setRequestHeader = vi.fn()
  send = vi.fn()

  constructor() {
    FakeXMLHttpRequest.lastInstance = this
  }

  triggerProgress(event: FakeProgressEvent) {
    this.upload.onprogress?.(event)
  }

  triggerLoad(status: number, response: unknown) {
    this.status = status
    this.response = response
    this.onload?.()
  }

  triggerError() {
    this.onerror?.()
  }
}

describe('createMediaResource', () => {
  const OriginalXHR = globalThis.XMLHttpRequest
  const OriginalFormData = globalThis.FormData

  beforeEach(() => {
    vi.clearAllMocks()
    FakeXMLHttpRequest.lastInstance = undefined

    vi.stubGlobal(
      'XMLHttpRequest',
      FakeXMLHttpRequest as unknown as typeof XMLHttpRequest,
    )

    // Minimal FormData stub; only the append call matters for these tests.
    class FakeFormData {
      append = vi.fn()
    }
    vi.stubGlobal('FormData', FakeFormData as unknown as typeof FormData)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    globalThis.XMLHttpRequest = OriginalXHR
    globalThis.FormData = OriginalFormData
  })

  it('searchPhotos calls apiGet with parseQueryParams output', async () => {
    const { api, apiGet } = makeApi()
    const deps = makeDeps()

    const media = createMediaResource(api, deps)

    apiGet.mockResolvedValue({ items: [], limit: 50, offset: 0, total: 0 })
    await expect(media.searchPhotos('cat')).resolves.toEqual({
      items: [],
      limit: 50,
      offset: 0,
      total: 0,
    })

    expect(apiGet).toHaveBeenCalledWith(
      '/media/photos?search=cat&offset=0&limit=50',
    )
  })

  it('deleteUploadedImage calls apiDelete with the correct path', async () => {
    const { api, apiDelete } = makeApi()
    const deps = makeDeps()

    const media = createMediaResource(api, deps)

    apiDelete.mockResolvedValue(undefined)
    await expect(media.deleteUploadedImage('p1')).resolves.toBeUndefined()

    expect(apiDelete).toHaveBeenCalledWith('/media/uploads/photos/p1')
  })

  it('uploadImage opens POST to resolved url, sets auth header when token exists, and reports progress', async () => {
    const { api } = makeApi()
    const deps = makeDeps({
      getToken: vi.fn(() => 'access.token'),
    })

    const media = createMediaResource(api, deps)

    const onProgress = vi.fn()
    const file = new File(['x'], 'x.png', { type: 'image/png' })

    const promise = media.uploadImage(file, onProgress)
    const xhr = FakeXMLHttpRequest.lastInstance
    expect(xhr).toBeDefined()

    expect(xhr!.open).toHaveBeenCalledWith(
      'POST',
      'https://example.test/media/uploads/photos',
    )
    expect(deps.getToken).toHaveBeenCalledWith(
      TokenScope.User,
      TokenType.Access,
    )
    expect(xhr!.setRequestHeader).toHaveBeenCalledWith(
      'Authorization',
      'Bearer access.token',
    )

    xhr!.triggerProgress({ lengthComputable: true, loaded: 25, total: 100 })
    expect(onProgress).toHaveBeenCalledWith(25)

    xhr!.triggerProgress({ lengthComputable: false, loaded: 50, total: 100 })
    expect(onProgress).toHaveBeenCalledTimes(1)

    const response = { id: 'photo1' }
    xhr!.triggerLoad(201, response)

    await expect(promise).resolves.toEqual(response)
    expect(deps.notifySuccess).toHaveBeenCalledWith(
      'Upload complete! Your image is ready to use.',
    )
    expect(deps.notifyError).not.toHaveBeenCalled()
  })

  it('uploadImage does not set auth header when no access token is available', async () => {
    const { api } = makeApi()
    const deps = makeDeps({
      getToken: vi.fn(() => undefined),
    })

    const media = createMediaResource(api, deps)

    const onProgress = vi.fn()
    const file = new File(['x'], 'x.png', { type: 'image/png' })

    const promise = media.uploadImage(file, onProgress)
    const xhr = FakeXMLHttpRequest.lastInstance
    expect(xhr).toBeDefined()

    expect(deps.getToken).toHaveBeenCalledWith(
      TokenScope.User,
      TokenType.Access,
    )
    expect(xhr!.setRequestHeader).not.toHaveBeenCalled()

    xhr!.triggerLoad(200, { id: 'photo1' })
    await expect(promise).resolves.toEqual({ id: 'photo1' })
  })

  it('uploadImage rejects and notifies error on non-2xx HTTP status', async () => {
    const { api } = makeApi()
    const deps = makeDeps({
      getToken: vi.fn(() => 'access.token'),
    })

    const media = createMediaResource(api, deps)

    const onProgress = vi.fn()
    const file = new File(['x'], 'x.png', { type: 'image/png' })

    const promise = media.uploadImage(file, onProgress)
    const xhr = FakeXMLHttpRequest.lastInstance!
    xhr.triggerLoad(500, { message: 'nope' })

    await expect(promise).rejects.toEqual('Upload failed (HTTP 500)')
    expect(deps.notifyError).toHaveBeenCalledWith(
      'Upload failed (HTTP 500). Please try again.',
    )
    expect(deps.notifySuccess).not.toHaveBeenCalled()
  })

  it('uploadImage rejects and notifies error on network failure', async () => {
    const { api } = makeApi()
    const deps = makeDeps({
      getToken: vi.fn(() => 'access.token'),
    })

    const media = createMediaResource(api, deps)

    const onProgress = vi.fn()
    const file = new File(['x'], 'x.png', { type: 'image/png' })

    const promise = media.uploadImage(file, onProgress)
    const xhr = FakeXMLHttpRequest.lastInstance!
    xhr.triggerError()

    await expect(promise).rejects.toEqual(
      'Upload failed due to a network error',
    )
    expect(deps.notifyError).toHaveBeenCalledWith(
      'Upload failed — looks like the network blinked. Please try again.',
    )
    expect(deps.notifySuccess).not.toHaveBeenCalled()
  })

  it('uploadImage appends the file to FormData', async () => {
    const { api } = makeApi()
    const deps = makeDeps({
      getToken: vi.fn(() => undefined),
    })

    const media = createMediaResource(api, deps)

    const onProgress = vi.fn()
    const file = new File(['x'], 'x.png', { type: 'image/png' })

    const appendMock = vi.fn()

    class TestFormData {
      append = appendMock
    }

    vi.stubGlobal('FormData', TestFormData as unknown as typeof FormData)

    try {
      const promise = media.uploadImage(file, onProgress)

      expect(appendMock).toHaveBeenCalledWith('file', file)

      const xhr = FakeXMLHttpRequest.lastInstance!
      xhr.triggerLoad(200, { id: 'photo1' })

      await expect(promise).resolves.toEqual({ id: 'photo1' })
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('uploadImage sets responseType to json', async () => {
    const { api } = makeApi()
    const deps = makeDeps()

    const media = createMediaResource(api, deps)

    const onProgress = vi.fn()
    const file = new File(['x'], 'x.png', { type: 'image/png' })

    const promise = media.uploadImage(file, onProgress)

    const xhr = FakeXMLHttpRequest.lastInstance!
    expect(xhr.responseType).toBe('json')

    xhr.triggerLoad(200, { id: 'photo1' })
    await expect(promise).resolves.toEqual({ id: 'photo1' })
  })

  it('uploadImage rounds progress percentage', async () => {
    const { api } = makeApi()
    const deps = makeDeps()

    const media = createMediaResource(api, deps)

    const onProgress = vi.fn()
    const file = new File(['x'], 'x.png', { type: 'image/png' })

    const promise = media.uploadImage(file, onProgress)

    const xhr = FakeXMLHttpRequest.lastInstance!
    xhr.triggerProgress({ lengthComputable: true, loaded: 1, total: 3 })

    expect(onProgress).toHaveBeenCalledWith(33)

    xhr.triggerLoad(200, { id: 'photo1' })
    await expect(promise).resolves.toEqual({ id: 'photo1' })
  })
})
