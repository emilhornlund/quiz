export const classNames = (...classes: (string | null | undefined)[]) => {
  return classes
    .filter((value) => !!value)
    .map((value) => value!.trim())
    .join(' ')
}

/**
 * Extracts the base URL from a full URL string.
 *
 * @param input - Full URL (e.g., 'https://klurigo.com/game?x=1')
 * @param options - Optional settings for URL extraction
 * @param options.omitProtocol - If true, removes the protocol (e.g., 'klurigo.com')
 * @returns The base URL, or undefined if input is invalid
 */
export const extractUrl = (
  input?: string,
  options?: { omitProtocol?: boolean },
): string | undefined => {
  if (!input) return undefined

  try {
    const url = new URL(input)
    return options?.omitProtocol ? url.host : `${url.protocol}//${url.host}`
  } catch {
    return undefined
  }
}

export const isValidNumber = (
  value: number | undefined,
  min?: number,
  max?: number,
): boolean => {
  if (value === undefined || Number.isNaN(value)) return false
  return !(
    (min !== undefined && value < min) ||
    (max !== undefined && value > max)
  )
}
