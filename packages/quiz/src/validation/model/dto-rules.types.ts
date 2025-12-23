import { ValidationRules } from './rules.types'

/**
 * Extracts keys from `T` whose property type includes `undefined`.
 *
 * Used to express optional DTO keys in a type-safe way.
 */
export type OptionalKeys<T extends object> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never
}[keyof T]

/**
 * Rule definition for a specific DTO type, including which keys are optional by default.
 */
export type DtoRules<
  T extends object,
  Opt extends readonly OptionalKeys<T>[],
> = {
  rules: ValidationRules<T>
  optionalKeys: Opt
}

/**
 * Type aliases describing discriminated unions and their variants.
 *
 * These power the `defineDiscriminatedRules` builder and `validateDiscriminatedDto` runtime.
 */
export type DiscriminatorKey = string
export type DiscriminatorValue = string | number
export type DiscriminatedUnion<K extends DiscriminatorKey> = Record<
  K,
  DiscriminatorValue
>
export type DiscriminatorValueOf<
  Union extends DiscriminatedUnion<K>,
  K extends DiscriminatorKey,
> = Union[K]
export type VariantOf<
  Union extends DiscriminatedUnion<K>,
  K extends DiscriminatorKey,
  V extends DiscriminatorValue,
> = Extract<Union, Record<K, V>>

/**
 * A discriminated ruleset that maps each discriminator value to a DTO ruleset.
 */
export type DiscriminatedRules<
  Union extends DiscriminatedUnion<K>,
  K extends DiscriminatorKey,
> = {
  discriminator: K
  variants: {
    [V in DiscriminatorValueOf<Union, K>]: DtoRules<
      VariantOf<Union, K, V>,
      readonly OptionalKeys<VariantOf<Union, K, V>>[]
    >
  }
}
