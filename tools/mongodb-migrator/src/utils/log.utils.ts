import { inspect } from 'util'

/**
 * Pretty-prints any JavaScript value to the console for debugging.
 *
 * @param object - The value or structure to inspect.
 */
export function logObject(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  object: any,
): void {
  console.log(inspect(object, false, null, true))
}
