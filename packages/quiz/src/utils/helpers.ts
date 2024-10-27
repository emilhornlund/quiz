export const classNames = (...classes: (string | null | undefined)[]) => {
  return classes
    .filter((value) => !!value)
    .map((value) => value!.trim())
    .join(' ')
}

export const extractUrl = (input?: string): string | undefined => {
  const regex = /^https?:\/\/(.*)$/
  const match = input?.match(regex)
  return match ? match[1] : undefined
}
