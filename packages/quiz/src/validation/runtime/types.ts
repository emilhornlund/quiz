import type {
  ArrayRule,
  BooleanRule,
  NumberRule,
  ObjectRule,
  StringRule,
} from '../model'

/**
 * Runtime rule type aliases used by the validator.
 *
 * These erase the DTO generic while retaining the rule `kind` discrimination.
 */
export type StringRuleRuntime = StringRule<object>
export type NumberRuleRuntime = NumberRule<object>
export type BooleanRuleRuntime = BooleanRule<object>
export type ArrayRuleRuntime = ArrayRule<unknown, object>
export type ObjectRuleRuntime = ObjectRule<Record<string, unknown>, object>

/**
 * Union of all supported rule kinds at runtime.
 */
export type AnyRule =
  | StringRuleRuntime
  | NumberRuleRuntime
  | BooleanRuleRuntime
  | ArrayRuleRuntime
  | ObjectRuleRuntime
