/**
 * Extracts the top-level field name from a validation path.
 *
 * Examples:
 * - `question` -> `question`
 * - `options[0].value` -> `options`
 * - `media.url` -> `media`
 */
export const topLevelFieldFromPath = (path: string): string => {
  const dotIndex = path.indexOf('.')
  const bracketIndex = path.indexOf('[')

  const end =
    dotIndex === -1
      ? bracketIndex === -1
        ? path.length
        : bracketIndex
      : bracketIndex === -1
        ? dotIndex
        : Math.min(dotIndex, bracketIndex)

  return path.slice(0, end)
}
