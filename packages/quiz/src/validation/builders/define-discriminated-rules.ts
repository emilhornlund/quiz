import {
  DiscriminatedRules,
  DiscriminatedUnion,
  DiscriminatorKey,
} from '../model'

/**
 * Builder for discriminated union validation rules.
 *
 * The discriminator key is used to select a variant rule set at runtime.
 */
export const defineDiscriminatedRules = <
  Union extends DiscriminatedUnion<K>,
  K extends DiscriminatorKey,
>(
  discriminator: K,
) => {
  return (
    variants: DiscriminatedRules<Union, K>['variants'],
  ): DiscriminatedRules<Union, K> => ({
    discriminator,
    variants,
  })
}
