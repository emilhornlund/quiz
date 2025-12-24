import type { OptionalKeys } from './dto-rules.types'

/**
 * Validator function for cross-field or custom checks.
 *
 * - `value` is the current property value being validated
 * - `dto` is the root DTO object
 * - `path` is the property path of the value being validated
 */
export type CustomValidator<TValue, TDto extends object> = (args: {
  value: TValue
  dto: TDto
  path: string
}) => string | null

/**
 * Common rule fields supported by all rule kinds.
 */
export type BaseRule<TValue, TDto extends object> = {
  required?: boolean
  oneOf?: readonly TValue[]
  custom?: CustomValidator<TValue, TDto>
}

/**
 * Validation rules for string properties.
 */
export type StringRule<TDto extends object> = BaseRule<string, TDto> & {
  kind: 'string'
  minLength?: number
  maxLength?: number
  regex?: RegExp
}

/**
 * Validation rules for numeric properties.
 */
export type NumberRule<TDto extends object> = BaseRule<number, TDto> & {
  kind: 'number'
  min?: number
  max?: number
  integer?: boolean
}

/**
 * Validation rules for boolean properties.
 */
export type BooleanRule<TDto extends object> = BaseRule<boolean, TDto> & {
  kind: 'boolean'
}

/**
 * Validation rules for object properties.
 *
 * `shape` describes nested property rules.
 * `optionalKeys` can override requiredness within the nested object shape.
 */
export type ObjectRule<TValue extends object, TDto extends object> = BaseRule<
  TValue,
  TDto
> & {
  kind: 'object'
  shape: ValidationRules<TValue>
  optionalKeys?: readonly OptionalKeys<TValue>[]
}

/**
 * Validation rules for array properties.
 */
export type ArrayRule<TElement, TDto extends object> = BaseRule<
  TElement[],
  TDto
> & {
  kind: 'array'
  minItems?: number
  maxItems?: number
  element: RuleFor<TElement, TDto>
}

/**
 * Maps a property type to its corresponding rule kind.
 */
export type RuleFor<TValue, TDto extends object> = TValue extends (infer U)[]
  ? ArrayRule<U, TDto>
  : TValue extends object
    ? ObjectRule<TValue, TDto>
    : TValue extends string
      ? StringRule<TDto>
      : TValue extends number
        ? NumberRule<TDto>
        : TValue extends boolean
          ? BooleanRule<TDto>
          : never

/**
 * A rule map for an entire DTO.
 *
 * Each property is validated using the rule type inferred from its non-nullable value type.
 */
export type ValidationRules<TDto extends object> = {
  [K in keyof TDto]-?: RuleFor<NonNullable<TDto[K]>, TDto>
}
