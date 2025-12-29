import type {
  GameQuestionPlayerEvent,
  SubmitQuestionAnswerRequestDto,
} from '@quiz/common'
import type { FC } from 'react'
import { useState } from 'react'

import { ProgressBar, Typography } from '../../components'
import { useGameContext } from '../../context/game'
import { GamePage, PlayerGameFooter, QuestionAnswerPicker } from '../common'

import styles from './PlayerQuestionState.module.scss'

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
    answer,
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
      align="space-between"
      footer={
        <PlayerGameFooter
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          nickname={nickname}
          totalScore={totalScore}
        />
      }>
      <Typography variant="title">{question.question}</Typography>

      <div className={styles.fullHeight}>
        <QuestionAnswerPicker
          question={question}
          submittedAnswer={answer}
          loading={isSubmittingQuestionAnswer}
          onChange={handleSubmitQuestionAnswer}
        />
      </div>

      <ProgressBar countdown={countdown} />
    </GamePage>
  )
}

export default PlayerQuestionState
