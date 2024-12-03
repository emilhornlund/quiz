import { faPen, faPlay } from '@fortawesome/free-solid-svg-icons'
import { QuizResponseDto } from '@quiz/common'
import React, { FC, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { useQuizServiceClient } from '../../../../api/use-quiz-service-client.tsx'
import { Typography } from '../../../../components'
import Button from '../../../../components/Button'
import useOnMount from '../../../../utils/use-on-mount.hook.tsx'

import styles from './QuizSubpage.module.scss'

const QuizSubpage: FC = () => {
  const mounted = useRef<boolean>(false)

  const { getCurrentPlayerQuizzes } = useQuizServiceClient()
  const [quizzes, setQuizzes] = useState<QuizResponseDto[]>([])

  useOnMount(() => {
    getCurrentPlayerQuizzes()
      .then(({ results }) => setQuizzes(results))
      .finally(() => {
        mounted.current = true
      })
  })

  return (
    <div className={styles.quizSubpage}>
      <Typography variant="subtitle" size="small">
        Quizzes
      </Typography>
      {quizzes.length ? (
        <div className={styles.quizTable}>
          {quizzes.map(({ id, title }) => (
            <div key={id} className={styles.quizItem}>
              <div className={styles.title}>{title}</div>
              <div className={styles.actions}>
                <Button
                  id="edit-quiz-button"
                  type="button"
                  kind="plain"
                  size="small"
                  icon={faPen}
                  iconColor="#808e9b"
                />
                <Button
                  id="start-game-button"
                  type="button"
                  kind="plain"
                  size="small"
                  icon={faPlay}
                  iconColor="#3c40c6"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <Typography variant="text" size="small">
            You have not created any quizzes yet
          </Typography>
        </>
      )}
      <Link to={'/create'}>
        <Typography variant="link">Create a Quiz</Typography>
      </Link>
    </div>
  )
}

export default QuizSubpage
