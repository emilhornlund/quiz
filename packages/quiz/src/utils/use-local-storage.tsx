import { useState } from 'react'

function setItem(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`Failed to set local storage item for key '${key}'`, err)
  }
}

function getItem<T>(key: string): T | undefined {
  try {
    const data = window.localStorage.getItem(key)
    return data ? (JSON.parse(data) as T) : undefined
  } catch (err) {
    console.error(`Failed to get local storage item for key '${key}'`, err)
  }
}

function removeItem(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch (err) {
    console.error(`Failed to remove local storage item for key '${key}'`, err)
  }
}

type DispatchAction<T> = T | ((prevState: T) => T)

/**
 * React hook for persisting state to `localStorage`.
 *
 * Retrieves an initial value from `localStorage` if available, and updates it
 * whenever the setter function is called. Also provides a method to clear the state.
 *
 * @param key - The `localStorage` key under which the value is stored.
 * @param initialValue - The initial value used if no data is found in `localStorage`.
 * @returns A tuple containing:
 *   - `value`: The current value.
 *   - `setValue`: A function to update the value (accepts a new value or updater function).
 *   - `clear`: A function to remove the value from both state and `localStorage`.
 */
export default function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState(() => {
    const data = getItem(key)
    return (data || initialValue) as T
  })

  function handleDispatch(action: DispatchAction<T>) {
    if (typeof action === 'function') {
      setValue((prevState) => {
        const newValue = (action as (prevState: T) => T)(prevState)
        setItem(key, newValue)
        return newValue
      })
    } else {
      setValue(action)
      setItem(key, action)
    }
  }

  function clearState() {
    setValue(undefined as T)
    removeItem(key)
  }

  return [value, handleDispatch, clearState] as const
}
