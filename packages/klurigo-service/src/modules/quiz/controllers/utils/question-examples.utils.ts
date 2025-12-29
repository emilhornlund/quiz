import {
  MediaType,
  QuestionMultiChoiceDto,
  QuestionRangeAnswerMargin,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionType,
  QuestionTypeAnswerDto,
} from '@klurigo/common'
import { ExamplesObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

export const QuestionRequestExamples: ExamplesObject = {
  'Multi Choice Question': {
    value: {
      type: QuestionType.MultiChoice,
      question: 'What is the capital of Sweden?',
      media: {
        type: MediaType.Image,
        url: 'https://example.com/question-image.png',
      },
      options: [
        {
          value: 'Stockholm',
          correct: true,
        },
        {
          value: 'Copenhagen',
          correct: false,
        },
        {
          value: 'London',
          correct: false,
        },
        {
          value: 'Berlin',
          correct: false,
        },
      ],
      points: 1000,
      duration: 30,
    } as QuestionMultiChoiceDto,
  },
  'Range Question': {
    value: {
      type: QuestionType.Range,
      question: 'Guess the temperature of the hottest day ever recorded.',
      media: {
        type: MediaType.Image,
        url: 'https://example.com/question-image.png',
      },
      min: 0,
      max: 100,
      correct: 50,
      margin: QuestionRangeAnswerMargin.Medium,
      points: 1000,
      duration: 30,
    } as QuestionRangeDto,
  },
  'True False Question': {
    value: {
      type: QuestionType.TrueFalse,
      question: 'The earth is flat.',
      media: {
        type: MediaType.Image,
        url: 'https://example.com/question-image.png',
      },
      correct: false,
      points: 1000,
      duration: 30,
    } as QuestionTrueFalseDto,
  },
  'Type Answer Question': {
    value: {
      type: QuestionType.TypeAnswer,
      question: 'What is the capital of Denmark?',
      media: {
        type: MediaType.Image,
        url: 'https://example.com/question-image.png',
      },
      options: ['Stockholm', 'Copenhagen', 'London', 'Berlin'],
      points: 1000,
      duration: 30,
    } as QuestionTypeAnswerDto,
  },
}

export const QuestionResponseMultiChoiceExample = {
  id: 'eaf37189-7aa7-455e-9e47-73db2a7d0a03',
  type: QuestionType.MultiChoice,
  question: 'What is the capital of Sweden?',
  media: {
    type: MediaType.Image,
    url: 'https://example.com/question-image.png',
  },
  options: [
    {
      value: 'Stockholm',
      correct: true,
    },
    {
      value: 'Copenhagen',
      correct: false,
    },
    {
      value: 'London',
      correct: false,
    },
    {
      value: 'Berlin',
      correct: false,
    },
  ],
  points: 1000,
  duration: 30,
  created: new Date(),
  updated: new Date(),
} as QuestionMultiChoiceDto

export const QuestionResponseExamples: ExamplesObject = {
  'Multi Choice Question': {
    value: {
      id: 'eaf37189-7aa7-455e-9e47-73db2a7d0a03',
      type: QuestionType.MultiChoice,
      question: 'What is the capital of Sweden?',
      media: {
        type: MediaType.Image,
        url: 'https://example.com/question-image.png',
      },
      options: [
        {
          value: 'Stockholm',
          correct: true,
        },
        {
          value: 'Copenhagen',
          correct: false,
        },
        {
          value: 'London',
          correct: false,
        },
        {
          value: 'Berlin',
          correct: false,
        },
      ],
      points: 1000,
      duration: 30,
      created: new Date(),
      updated: new Date(),
    } as QuestionMultiChoiceDto,
  },
  'Range Question': {
    value: {
      id: 'eaf37189-7aa7-455e-9e47-73db2a7d0a03',
      type: QuestionType.Range,
      question: 'Guess the temperature of the hottest day ever recorded.',
      media: {
        type: MediaType.Image,
        url: 'https://example.com/question-image.png',
      },
      min: 0,
      max: 100,
      correct: 50,
      margin: QuestionRangeAnswerMargin.Medium,
      points: 1000,
      duration: 30,
      created: new Date(),
      updated: new Date(),
    } as QuestionRangeDto,
  },
  'True False Question': {
    value: {
      id: 'eaf37189-7aa7-455e-9e47-73db2a7d0a03',
      type: QuestionType.TrueFalse,
      question: 'The earth is flat.',
      media: {
        type: MediaType.Image,
        url: 'https://example.com/question-image.png',
      },
      correct: false,
      points: 1000,
      duration: 30,
      created: new Date(),
      updated: new Date(),
    } as QuestionTrueFalseDto,
  },
  'Type Answer Question': {
    value: {
      id: 'eaf37189-7aa7-455e-9e47-73db2a7d0a03',
      type: QuestionType.TypeAnswer,
      question: 'What is the capital of Denmark?',
      media: {
        type: MediaType.Image,
        url: 'https://example.com/question-image.png',
      },
      options: ['Stockholm', 'Copenhagen', 'London', 'Berlin'],
      points: 1000,
      duration: 30,
      created: new Date(),
      updated: new Date(),
    } as QuestionTypeAnswerDto,
  },
}
