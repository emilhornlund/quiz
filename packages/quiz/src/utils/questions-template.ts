import {
  MediaType,
  QuestionRangeAnswerMargin,
  QuestionType,
  QuizClassicModeRequestDto,
  QuizZeroToOneHundredModeRequestDto,
} from '@quiz/common'

export const DEFAULT_CLASSIC_MODE_QUESTIONS: QuizClassicModeRequestDto['questions'] =
  [
    {
      type: QuestionType.MultiChoice,
      question: '',
      media: {
        type: MediaType.Image,
        url: '',
      },
      options: [
        {
          value: '',
          correct: false,
        },
        {
          value: '',
          correct: false,
        },
        {
          value: '',
          correct: false,
        },
        {
          value: '',
          correct: false,
        },
      ],
      points: 1000,
      duration: 30,
    },
    {
      type: QuestionType.Range,
      question: '',
      media: {
        type: MediaType.Image,
        url: '',
      },
      min: 0,
      max: 100,
      margin: QuestionRangeAnswerMargin.Medium,
      correct: 50,
      points: 1000,
      duration: 30,
    },
    {
      type: QuestionType.TrueFalse,
      question: '',
      media: {
        type: MediaType.Image,
        url: '',
      },
      correct: true,
      points: 1000,
      duration: 30,
    },
    {
      type: QuestionType.TypeAnswer,
      question: '',
      media: {
        type: MediaType.Image,
        url: '',
      },
      options: [
        { value: '', correct: true },
        { value: '', correct: true },
        { value: '', correct: true },
        { value: '', correct: true },
      ],
      points: 1000,
      duration: 30,
    },
  ]

export const DEFAULT_ZERO_TO_ONE_HUNDRED_MODE_QUESTIONS: QuizZeroToOneHundredModeRequestDto['questions'] =
  [
    {
      type: QuestionType.Range,
      question: '',
      media: {
        type: MediaType.Image,
        url: '',
      },
      correct: 50,
      duration: 30,
    },
  ]
