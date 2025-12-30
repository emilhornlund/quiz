import {
  MediaType,
  QuestionImageRevealEffectType,
  QuestionRangeAnswerMargin,
  QuestionType,
} from '@klurigo/common'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, expect, it, vi } from 'vitest'

import type { ValidationResult } from '../../../../../../../../validation'

import QuestionField from './QuestionField'
import { QuestionFieldType } from './types'

vi.mock('react-player', () => ({
  default: () => <div data-testid="mock-player">Mock Player</div>,
}))

type AnyValidation = ValidationResult<Record<string, unknown>>

function makeValidation(
  errors: Array<{ path: string; message: string }> = [],
): AnyValidation {
  return {
    valid: errors.length === 0,
    errors: errors.map((e) => ({ path: e.path, message: e.message })),
  } as unknown as AnyValidation
}

describe('QuestionField', () => {
  it('renders a duration question field', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.CommonDuration}
        value={30}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders a image media question field', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.CommonMedia}
        value={{ type: MediaType.Image, url: 'https://example.com/image.png' }}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders a video media question field', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.CommonMedia}
        value={{ type: MediaType.Video, url: 'https://example.com/video.mp4' }}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders a audio media question field', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.CommonMedia}
        value={{ type: MediaType.Audio, url: 'https://example.com/music.mp3' }}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders a points question field', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.CommonPoints}
        value={1000}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders a question text question field', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.CommonQuestion}
        value="Who painted The Starry Night?"
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders a multiple choice type question field', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.CommonType}
        value={QuestionType.MultiChoice}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders a range type question field', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.CommonType}
        value={QuestionType.Range}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders a true or false question field', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.CommonType}
        value={QuestionType.TrueFalse}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders a type answer question field', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.CommonType}
        value={QuestionType.TypeAnswer}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders a multiple choice options question field', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.MultiChoiceOptions}
        values={[
          {
            value: 'Stockholm',
            correct: true,
          },
          {
            value: 'Paris',
            correct: false,
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
            value: 'Oslo',
            correct: false,
          },
          {
            value: 'Berlin',
            correct: false,
          },
        ]}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders a range correct question field', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.RangeCorrect}
        value={50}
        min={0}
        max={100}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders a range margin question field', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.RangeMargin}
        value={QuestionRangeAnswerMargin.Medium}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders a range max question field', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.RangeMax}
        value={100}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders a range min question field', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.RangeMin}
        value={0}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders a true or false options question field', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.TrueFalseOptions}
        value={true}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders a type answer options question field', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.TypeAnswerOptions}
        values={['first', 'second', 'third', 'fourth']}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders an image media question field with blur effect', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.CommonMedia}
        value={{
          type: MediaType.Image,
          url: 'https://example.com/image.png',
          effect: QuestionImageRevealEffectType.Blur,
        }}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )
    expect(container).toMatchSnapshot()
  })

  it('renders an image media question field with square effect', () => {
    const { container } = render(
      <QuestionField
        type={QuestionFieldType.CommonMedia}
        value={{
          type: MediaType.Image,
          url: 'https://example.com/image.png',
          effect: QuestionImageRevealEffectType.Square3x3,
        }}
        validation={makeValidation()}
        onChange={() => undefined}
      />,
    )
    expect(container).toMatchSnapshot()
  })
})
