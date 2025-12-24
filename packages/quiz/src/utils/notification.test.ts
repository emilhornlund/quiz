import type { Mock } from 'vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('react-toastify', () => {
  const success = vi.fn()
  const warning = vi.fn()
  const error = vi.fn()

  const Bounce = 'MockBounce'

  return {
    Bounce,
    toast: { success, warning, error },
  }
})

import { notifyError, notifySuccess, notifyWarning } from './notification'

// eslint-disable-next-line import/order
import { Bounce, toast } from 'react-toastify'

describe('notifications helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('notifySuccess calls toast.success with merged options and green bg', () => {
    notifySuccess('All good')

    expect(toast.success).toHaveBeenCalledTimes(1)
    const [msg, opts] = (toast.success as Mock).mock.calls[0]

    expect(msg).toBe('All good')
    expect(opts).toEqual(
      expect.objectContaining({
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
        transition: Bounce,
        style: { backgroundColor: '#05c46b' },
      }),
    )
  })

  it('notifyWarning calls toast.warning with merged options and amber bg', () => {
    notifyWarning('Careful')

    expect(toast.warning).toHaveBeenCalledTimes(1)
    const [msg, opts] = (toast.warning as Mock).mock.calls[0]

    expect(msg).toBe('Careful')
    expect(opts).toEqual(
      expect.objectContaining({
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
        transition: Bounce,
        style: { backgroundColor: '#ffa801' },
      }),
    )
  })

  it('notifyError calls toast.error with merged options and red bg', () => {
    notifyError('Boom')

    expect(toast.error).toHaveBeenCalledTimes(1)
    const [msg, opts] = (toast.error as Mock).mock.calls[0]

    expect(msg).toBe('Boom')
    expect(opts).toEqual(
      expect.objectContaining({
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
        transition: Bounce,
        style: { backgroundColor: '#ff3f34' },
      }),
    )
  })

  it('subsequent calls use their own style (no mutation bleed)', () => {
    notifySuccess('ok')
    notifyWarning('warn')
    notifyError('err')

    const successOpts = (toast.success as Mock).mock.calls[0][1]
    const warningOpts = (toast.warning as Mock).mock.calls[0][1]
    const errorOpts = (toast.error as Mock).mock.calls[0][1]

    expect(successOpts.style).toEqual({ backgroundColor: '#05c46b' })
    expect(warningOpts.style).toEqual({ backgroundColor: '#ffa801' })
    expect(errorOpts.style).toEqual({ backgroundColor: '#ff3f34' })
  })
})
