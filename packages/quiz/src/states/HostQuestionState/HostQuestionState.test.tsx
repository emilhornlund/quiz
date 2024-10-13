import { GameEventType, QuestionType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import HostQuestionState from './HostQuestionState'

describe('HostQuestionState', () => {
  it('should render HostQuestionState with question type multi and two answers', async () => {
    const { container } = render(
      <HostQuestionState
        event={{
          type: GameEventType.GameQuestionHost,
          gamePIN: '123456',
          question: {
            type: QuestionType.Multi,
            question: 'Who painted The Starry Night?',
            imageURL:
              'https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg',
            answers: [
              { value: 'Vincent van Gogh' },
              { value: 'Pablo Picasso' },
            ],
            duration: 30,
          },
          submissions: { current: 3, total: 10 },
          pagination: { current: 1, total: 20 },
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render HostQuestionState with question type multi and four answers', async () => {
    const { container } = render(
      <HostQuestionState
        event={{
          type: GameEventType.GameQuestionHost,
          gamePIN: '123456',
          question: {
            type: QuestionType.Multi,
            question: 'Who painted The Starry Night?',
            imageURL: 'https://wallpapercave.com/wp/wp2824407.jpg',
            answers: [
              { value: 'Vincent van Gogh' },
              { value: 'Pablo Picasso' },
              { value: 'Leonardo da Vinci' },
              { value: 'Claude Monet' },
            ],
            duration: 30,
          },
          submissions: { current: 3, total: 10 },
          pagination: { current: 1, total: 20 },
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render HostQuestionState with question type multi and six answers', async () => {
    const { container } = render(
      <HostQuestionState
        event={{
          type: GameEventType.GameQuestionHost,
          gamePIN: '123456',
          question: {
            type: QuestionType.Multi,
            question: 'Who painted The Starry Night?',
            imageURL: 'https://wallpaperaccess.com/full/157316.jpg',
            answers: [
              { value: 'Vincent van Gogh' },
              { value: 'Pablo Picasso' },
              { value: 'Leonardo da Vinci' },
              { value: 'Claude Monet' },
              { value: 'Michelangelo' },
              { value: 'Rembrandt' },
            ],
            duration: 30,
          },
          submissions: { current: 3, total: 10 },
          pagination: { current: 1, total: 20 },
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render HostQuestionState with question type slider', async () => {
    const { container } = render(
      <HostQuestionState
        event={{
          type: GameEventType.GameQuestionHost,
          gamePIN: '123456',
          question: {
            type: QuestionType.Slider,
            question:
              "What percentage of the earth's surface is covered by water?",
            min: 0,
            max: 100,
            step: 1,
            duration: 30,
          },
          submissions: { current: 3, total: 10 },
          pagination: { current: 1, total: 20 },
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render HostQuestionState with question type true false', async () => {
    const { container } = render(
      <HostQuestionState
        event={{
          type: GameEventType.GameQuestionHost,
          gamePIN: '123456',
          question: {
            type: QuestionType.TrueFalse,
            question: "Rabbits can't vomit?",
            duration: 30,
          },
          submissions: { current: 3, total: 10 },
          pagination: { current: 1, total: 20 },
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render HostQuestionState with question type type answer', async () => {
    const { container } = render(
      <HostQuestionState
        event={{
          type: GameEventType.GameQuestionHost,
          gamePIN: '123456',
          question: {
            type: QuestionType.TypeAnswer,
            question: 'Who painted the Mono Lisa?',
            duration: 30,
          },
          submissions: { current: 3, total: 10 },
          pagination: { current: 1, total: 20 },
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
