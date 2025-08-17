import {
  GameQuestionPlayerEvent,
  SubmitQuestionAnswerRequestDto,
} from '@quiz/common'
import React, { FC, useState } from 'react'

import {
  PlayerGameFooter,
  ProgressBar,
  QuestionAnswerPicker,
  Typography,
} from '../../components'
import { useGameContext } from '../../context/game'
import { GamePage } from '../common'

export interface PlayerQuestionStateProps {
  event: GameQuestionPlayerEvent
}

const PlayerQuestionState: FC<PlayerQuestionStateProps> = ({
  event: {
    player: {
      nickname,
      score: { total: totalScore },
    },
    question,
    countdown,
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => {
  const [isSubmittingQuestionAnswer, setIsSubmittingQuestionAnswer] =
    useState<boolean>(false)

  const { submitQuestionAnswer } = useGameContext()

  const handleSubmitQuestionAnswer = (
    request: SubmitQuestionAnswerRequestDto,
  ) => {
    setIsSubmittingQuestionAnswer(true)
    submitQuestionAnswer?.(request).finally(() =>
      setIsSubmittingQuestionAnswer(false),
    )
  }

  return (
    <GamePage
      height="full"
      footer={
        <PlayerGameFooter
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          nickname={nickname}
          totalScore={totalScore}
        />
      }>
      <Typography variant="subtitle" size="medium">
        {question.question}
      </Typography>

      <QuestionAnswerPicker
        question={question}
        loading={isSubmittingQuestionAnswer}
        onChange={handleSubmitQuestionAnswer}
      />

      <ProgressBar countdown={countdown} />
    </GamePage>
  )
}

export default PlayerQuestionState
