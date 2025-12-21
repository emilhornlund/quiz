import { QuestionType, ZeroToOneHundredQuestionDto } from '@quiz/common'

import { defineDiscriminatedRules } from '../../../validation'

import { zeroToOneHundredRangeRules } from './zero-to-one-hundred-range.rules'

/**
 * Discriminated validation rules for ZeroToOneHundred mode questions.
 *
 * Selects the correct DTO rule set based on the `type` discriminator.
 */
export const zeroToOneHundredQuestionRules = defineDiscriminatedRules<
  ZeroToOneHundredQuestionDto,
  'type'
>('type')({
  [QuestionType.Range]: zeroToOneHundredRangeRules,
})
