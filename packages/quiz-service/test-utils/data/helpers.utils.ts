export function offsetSeconds(seconds: number): Date {
  return offsetMilliseconds(seconds * 1000)
}

export function offsetMilliseconds(milliseconds: number): Date {
  return new Date(new Date('2025-04-09T14:43:03.687Z').getTime() + milliseconds)
}
