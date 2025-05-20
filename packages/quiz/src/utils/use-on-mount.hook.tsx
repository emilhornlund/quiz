import { useEffect, useRef } from 'react'

/**
 * A custom React hook that executes a callback function once, when the component is mounted.
 *
 * @param callback - A function to be executed on mount.
 */
const useOnMount = (callback: () => void) => {
  const didMount = useRef<boolean | undefined>(undefined)
  useEffect(() => {
    if (callback && !didMount.current) {
      didMount.current = true
      callback()
    }
  }, [callback])
}

export default useOnMount
