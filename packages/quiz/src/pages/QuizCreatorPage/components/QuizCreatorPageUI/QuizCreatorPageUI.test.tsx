import {
  GameMode,
  MediaType,
  QuestionRangeAnswerMargin,
  QuestionType,
} from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import QuizCreatorPageUI from './QuizCreatorPageUI'

describe('QuizCreatorPageUI', () => {
  it('renders QuizCreatorPageUI without mdoe', () => {
    const { container } = render(
      <MemoryRouter>
        <QuizCreatorPageUI
          gameMode={undefined}
          onSelectGameMode={() => undefined}
          quizSettings={{}}
          allQuizSettingsValid={false}
          onQuizSettingsValueChange={() => undefined}
          onQuizSettingsValidChange={() => undefined}
          questions={[]}
          allQuestionsValid={false}
          selectedQuestion={undefined}
          selectedQuestionIndex={0}
          onSetQuestions={() => undefined}
          onSelectedQuestionIndex={() => undefined}
          onAddQuestion={() => undefined}
          onQuestionValueChange={() => undefined}
          onQuestionValueValidChange={() => undefined}
          onDropQuestionIndex={() => undefined}
          onDuplicateQuestionIndex={() => undefined}
          onDeleteQuestionIndex={() => undefined}
          onReplaceQuestion={() => undefined}
          onSaveQuiz={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders QuizCreatorPageUI for classic mode without questions', () => {
    const { container } = render(
      <MemoryRouter>
        <QuizCreatorPageUI
          gameMode={GameMode.Classic}
          onSelectGameMode={() => undefined}
          quizSettings={{}}
          allQuizSettingsValid={false}
          onQuizSettingsValueChange={() => undefined}
          onQuizSettingsValidChange={() => undefined}
          questions={[]}
          allQuestionsValid={false}
          selectedQuestion={undefined}
          selectedQuestionIndex={0}
          onSetQuestions={() => undefined}
          onSelectedQuestionIndex={() => undefined}
          onAddQuestion={() => undefined}
          onQuestionValueChange={() => undefined}
          onQuestionValueValidChange={() => undefined}
          onDropQuestionIndex={() => undefined}
          onDuplicateQuestionIndex={() => undefined}
          onDeleteQuestionIndex={() => undefined}
          onReplaceQuestion={() => undefined}
          onSaveQuiz={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders QuizCreatorPageUI for classic mode', () => {
    const { container } = render(
      <MemoryRouter>
        <QuizCreatorPageUI
          gameMode={GameMode.Classic}
          onSelectGameMode={() => undefined}
          quizSettings={{}}
          allQuizSettingsValid={false}
          onQuizSettingsValueChange={() => undefined}
          onQuizSettingsValidChange={() => undefined}
          questions={[
            {
              mode: GameMode.Classic,
              data: {
                type: QuestionType.MultiChoice,
                question: 'Who painted The Starry Night?',
                media: {
                  type: MediaType.Image,
                  url: 'https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg',
                },
                options: [
                  { value: 'Vincent van Gogh', correct: true },
                  { value: 'Pablo Picasso', correct: false },
                  { value: 'Leonardo da Vinci', correct: false },
                  { value: 'Claude Monet', correct: false },
                  { value: 'Michelangelo', correct: false },
                  { value: 'Rembrandt', correct: false },
                ],
                points: 1000,
                duration: 30,
              },
              validation: {},
            },
            {
              mode: GameMode.Classic,
              data: {
                type: QuestionType.Range,
                question:
                  "What percentage of the earth's surface is covered by water?",
                media: {
                  type: MediaType.Image,
                  url: 'https://editalconcursosbrasil.com.br/wp-content/uploads/2022/12/planeta-terra-scaled.jpg',
                },
                min: 0,
                max: 100,
                margin: QuestionRangeAnswerMargin.Medium,
                correct: 71,
                points: 1000,
                duration: 30,
              },
              validation: {},
            },
            {
              mode: GameMode.Classic,
              data: {
                type: QuestionType.TrueFalse,
                question: "Rabbits can't vomit?",
                media: {
                  type: MediaType.Image,
                  url: 'https://assets.petco.com/petco/image/upload/f_auto,q_auto/rabbit-care-sheet',
                },
                correct: true,
                points: 1000,
                duration: 30,
              },
              validation: {},
            },
            {
              mode: GameMode.Classic,
              data: {
                type: QuestionType.TypeAnswer,
                question: 'Who painted the Mono Lisa?',
                media: {
                  type: MediaType.Image,
                  url: 'https://i.pinimg.com/originals/a1/4a/04/a14a0433d085057106b61a5ef63c7249.jpg',
                },
                options: ['leonardo da vinci', 'leonardo', 'da vinci'],
                points: 1000,
                duration: 30,
              },
              validation: {},
            },
          ]}
          selectedQuestion={{
            mode: GameMode.Classic,
            data: {
              type: QuestionType.MultiChoice,
              question: 'Who painted The Starry Night?',
              media: {
                type: MediaType.Image,
                url: 'https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg',
              },
              options: [
                { value: 'Vincent van Gogh', correct: true },
                { value: 'Pablo Picasso', correct: false },
                { value: 'Leonardo da Vinci', correct: false },
                { value: 'Claude Monet', correct: false },
                { value: 'Michelangelo', correct: false },
                { value: 'Rembrandt', correct: false },
              ],
              points: 1000,
              duration: 30,
            },
            validation: {},
          }}
          allQuestionsValid={false}
          selectedQuestionIndex={0}
          onSetQuestions={() => undefined}
          onSelectedQuestionIndex={() => undefined}
          onAddQuestion={() => undefined}
          onQuestionValueChange={() => undefined}
          onQuestionValueValidChange={() => undefined}
          onDropQuestionIndex={() => undefined}
          onDuplicateQuestionIndex={() => undefined}
          onDeleteQuestionIndex={() => undefined}
          onReplaceQuestion={() => undefined}
          onSaveQuiz={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders QuizCreatorPageUI for zero to one hundred mode without questions', () => {
    const { container } = render(
      <MemoryRouter>
        <QuizCreatorPageUI
          gameMode={GameMode.ZeroToOneHundred}
          onSelectGameMode={() => undefined}
          quizSettings={{}}
          allQuizSettingsValid={false}
          onQuizSettingsValueChange={() => undefined}
          onQuizSettingsValidChange={() => undefined}
          questions={[]}
          allQuestionsValid={false}
          selectedQuestion={undefined}
          selectedQuestionIndex={0}
          onSetQuestions={() => undefined}
          onSelectedQuestionIndex={() => undefined}
          onAddQuestion={() => undefined}
          onQuestionValueChange={() => undefined}
          onQuestionValueValidChange={() => undefined}
          onDropQuestionIndex={() => undefined}
          onDuplicateQuestionIndex={() => undefined}
          onDeleteQuestionIndex={() => undefined}
          onReplaceQuestion={() => undefined}
          onSaveQuiz={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders QuizCreatorPageUI for zero to one hundred mode', () => {
    const { container } = render(
      <MemoryRouter>
        <QuizCreatorPageUI
          gameMode={GameMode.ZeroToOneHundred}
          onSelectGameMode={() => undefined}
          quizSettings={{}}
          allQuizSettingsValid={false}
          onQuizSettingsValueChange={() => undefined}
          onQuizSettingsValidChange={() => undefined}
          questions={[
            {
              mode: GameMode.ZeroToOneHundred,
              data: {
                type: QuestionType.Range,
                question:
                  "What percentage of the earth's surface is covered by water?",
                media: {
                  type: MediaType.Image,
                  url: 'https://editalconcursosbrasil.com.br/wp-content/uploads/2022/12/planeta-terra-scaled.jpg',
                },
                correct: 71,
                duration: 30,
              },
              validation: {},
            },
          ]}
          allQuestionsValid={false}
          selectedQuestion={undefined}
          selectedQuestionIndex={0}
          onSetQuestions={() => undefined}
          onSelectedQuestionIndex={() => undefined}
          onAddQuestion={() => undefined}
          onQuestionValueChange={() => undefined}
          onQuestionValueValidChange={() => undefined}
          onDropQuestionIndex={() => undefined}
          onDuplicateQuestionIndex={() => undefined}
          onDeleteQuestionIndex={() => undefined}
          onReplaceQuestion={() => undefined}
          onSaveQuiz={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
