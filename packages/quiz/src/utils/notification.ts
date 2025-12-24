import type { ToastOptions } from 'react-toastify'
import { Bounce, toast } from 'react-toastify'

/**
 * Base toast configuration shared by all notification helpers.
 *
 * - Position: top-right
 * - Auto close after 5s
 * - Colored theme with Bounce transition
 * - Click/hover/drag behavior enabled
 */
const options: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'colored',
  transition: Bounce,
}

/**
 * Show a green success toast.
 *
 * @param message Text content of the toast.
 */
export const notifySuccess = (message: string) =>
  toast.success(message, { ...options, style: { backgroundColor: '#05c46b' } })

/**
 * Show an amber warning toast.
 *
 * @param message Text content of the toast.
 */
export const notifyWarning = (message: string) =>
  toast.warning(message, { ...options, style: { backgroundColor: '#ffa801' } })

/**
 * Show a red error toast.
 *
 * @param message Text content of the toast.
 */
export const notifyError = (message: string) =>
  toast.error(message, { ...options, style: { backgroundColor: '#ff3f34' } })
