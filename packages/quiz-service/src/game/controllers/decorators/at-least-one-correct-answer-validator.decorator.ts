import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

import { CreateClassicModeQuestionMultiChoiceAnswerRequest } from '../models/requests/create-classic-mode-question-multi-choice-answer.request'

@ValidatorConstraint({ name: 'atLeastOneCorrectAnswer', async: false })
export class AtLeastOneCorrectAnswerValidator
  implements ValidatorConstraintInterface
{
  validate(
    answers: CreateClassicModeQuestionMultiChoiceAnswerRequest[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    args: ValidationArguments,
  ) {
    if (!Array.isArray(answers)) {
      return false
    }
    return answers.some((answer) => answer.correct === true)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments) {
    return 'At least one answer must be marked as correct'
  }
}
