export const classNames = (...classes: (string | null | undefined)[]) => {
  return classes
    .filter((value) => !!value)
    .map((value) => value!.trim())
    .join(' ')
}
