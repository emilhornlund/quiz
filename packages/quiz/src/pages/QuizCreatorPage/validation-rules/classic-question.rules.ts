import type { ClassicQuestionDto } from '@quiz/common'
import { QuestionType } from '@quiz/common'

import { defineDiscriminatedRules } from '../../../validation'

import { classicMultiChoiceRules } from './classic-multi-choice.rules'
import { classicPinRules } from './classic-pin.rules'
import { classicPuzzleRules } from './classic-puzzle.rules'
import { classicRangeRules } from './classic-range.rules'
import { classicTrueFalseRules } from './classic-true-false.rules'
import { classicTypeAnswerRules } from './classic-type-answer.rules'

/**
 * Discriminated validation rules for Classic mode questions.
 *
 * Selects the correct DTO rule set based on the `type` discriminator.
 */
export const classicQuestionRules = defineDiscriminatedRules<
  ClassicQuestionDto,
  'type'
>('type')({
  [QuestionType.MultiChoice]: classicMultiChoiceRules,
  [QuestionType.TrueFalse]: classicTrueFalseRules,
  [QuestionType.Range]: classicRangeRules,
  [QuestionType.TypeAnswer]: classicTypeAnswerRules,
  [QuestionType.Pin]: classicPinRules,
  [QuestionType.Puzzle]: classicPuzzleRules,
})
