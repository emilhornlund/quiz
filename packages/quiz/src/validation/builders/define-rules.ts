import { DtoRules, OptionalKeys, ValidationRules } from '../model'

/**
 * Builder for strongly-typed DTO validation rules.
 *
 * Supports declaring optional keys separately from the rule definitions, enabling
 * runtime requiredness behavior without needing `required: false` everywhere.
 */
export const defineRules = <T extends object>() => {
  return <Opt extends readonly OptionalKeys<T>[]>(options?: {
    optionalKeys?: Opt
  }) => {
    return (rules: ValidationRules<T>): DtoRules<T, Opt> => ({
      rules,
      optionalKeys: (options?.optionalKeys ?? ([] as unknown as Opt)) as Opt,
    })
  }
}
