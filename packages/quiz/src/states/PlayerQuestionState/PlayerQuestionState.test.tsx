import { GameEventQuestionType, GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import PlayerQuestionState from './PlayerQuestionState'

describe('PlayerQuestionState', () => {
  it('should render PlayerQuestionState with question type multi and two answers', () => {
    const { container } = render(
      <PlayerQuestionState
        event={{
          type: GameEventType.QuestionPlayer,
          nickname: 'FrostyBear',
          question: {
            type: GameEventQuestionType.Multi,
            question: 'Who painted The Starry Night?',
            imageURL:
              'https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg',
            answers: [
              { value: 'Vincent van Gogh' },
              { value: 'Pablo Picasso' },
            ],
            duration: 30,
          },
          time: 20,
          score: { total: 10458 },
          pagination: { current: 1, total: 20 },
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render PlayerQuestionState with question type multi and four answers', () => {
    const { container } = render(
      <PlayerQuestionState
        event={{
          type: GameEventType.QuestionPlayer,
          nickname: 'FrostyBear',
          question: {
            type: GameEventQuestionType.Multi,
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
          time: 20,
          score: { total: 10458 },
          pagination: { current: 1, total: 20 },
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render PlayerQuestionState with question type multi and six answers', () => {
    const { container } = render(
      <PlayerQuestionState
        event={{
          type: GameEventType.QuestionPlayer,
          nickname: 'FrostyBear',
          question: {
            type: GameEventQuestionType.Multi,
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
          time: 20,
          score: { total: 10458 },
          pagination: { current: 1, total: 20 },
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render PlayerQuestionState with question type slider', () => {
    const { container } = render(
      <PlayerQuestionState
        event={{
          type: GameEventType.QuestionPlayer,
          nickname: 'FrostyBear',
          question: {
            type: GameEventQuestionType.Slider,
            question:
              "What percentage of the earth's surface is covered by water?",
            min: 0,
            max: 100,
            step: 1,
            duration: 30,
          },
          time: 20,
          score: { total: 10458 },
          pagination: { current: 1, total: 20 },
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render PlayerQuestionState with question type true false', () => {
    const { container } = render(
      <PlayerQuestionState
        event={{
          type: GameEventType.QuestionPlayer,
          nickname: 'FrostyBear',
          question: {
            type: GameEventQuestionType.TrueFalse,
            question: "Rabbits can't vomit?",
            duration: 30,
          },
          time: 20,
          score: { total: 10458 },
          pagination: { current: 1, total: 20 },
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render PlayerQuestionState with question type type answer', () => {
    const { container } = render(
      <PlayerQuestionState
        event={{
          type: GameEventType.QuestionPlayer,
          nickname: 'FrostyBear',
          question: {
            type: GameEventQuestionType.TypeAnswer,
            question: 'Who painted the Mono Lisa?',
            duration: 30,
          },
          time: 20,
          score: { total: 10458 },
          pagination: { current: 1, total: 20 },
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
