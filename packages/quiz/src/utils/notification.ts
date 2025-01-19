import { Bounce, toast, ToastOptions } from 'react-toastify'

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

export const notifySuccess = (message: string) =>
  toast.success(message, { ...options, style: { backgroundColor: '#05c46b' } })

export const notifyWarning = (message: string) =>
  toast.warning(message, { ...options, style: { backgroundColor: '#ffa801' } })

export const notifyError = (message: string) =>
  toast.error(message, { ...options, style: { backgroundColor: '#ff3f34' } })
