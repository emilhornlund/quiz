import { CreateGameRequestDto, GameMode, QuestionType } from '@quiz/common'
import React, {
  FC,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import {
  IconButtonArrowRight,
  Page,
  Select,
  Textarea,
  TextField,
} from '../../components'
import { useGameStorage } from '../../utils/use-game-storage'
import { useQuizService } from '../../utils/use-quiz-service.tsx'

import styles from './CreateGamePage.module.scss'
import { parseQuestionsJson, QuestionsForMode } from './helpers.ts'

const GameModeLabels: { [key in GameMode]: string } = {
  [GameMode.Classic]: 'Classic',
  [GameMode.ZeroToOneHundred]: '0 - 100',
}

const CreateGamePage: FC = () => {
  const navigate = useNavigate()

  const { createGame } = useQuizService()
  const [, persistGameData] = useGameStorage()

  const [name, setName] = useState<string>('')
  const [mode, setMode] = useState<GameMode>(GameMode.Classic)

  const [classicModeQuestions, setClassicModeQuestions] = useState<
    QuestionsForMode<GameMode.Classic>
  >([])
  const [zeroToOneHundredModeQuestions, setZeroToOneHundredModeQuestions] =
    useState<QuestionsForMode<GameMode.ZeroToOneHundred>>([])

  const [questionsJson, setQuestionsJson] = useState<string>('[]')
  const [jsonError, setJsonError] = useState<string>()

  const isValid = useMemo(() => {
    const isNameValid = !!name
    const isModeValid = !!mode
    const isQuestionsValid =
      !!(mode === GameMode.Classic && classicModeQuestions.length) ||
      !!(
        mode === GameMode.ZeroToOneHundred &&
        zeroToOneHundredModeQuestions.length
      )
    return isNameValid && isModeValid && isQuestionsValid
  }, [name, mode, classicModeQuestions, zeroToOneHundredModeQuestions])

  const handleChangeMode = useCallback((newMode: GameMode) => {
    setMode(newMode)
    if (newMode === GameMode.Classic) {
      handleParseQuestionJson(
        JSON.stringify(
          [
            {
              type: QuestionType.Multi,
              question: '',
              imageURL: '',
              answers: [
                { value: '', correct: false },
                { value: '', correct: false },
                { value: '', correct: false },
                { value: '', correct: false },
              ],
              points: 1000,
              duration: 30,
            },
            {
              type: QuestionType.TrueFalse,
              question: '',
              imageURL: '',
              correct: false,
              points: 1000,
              duration: 30,
            },
            {
              type: QuestionType.Slider,
              question: '',
              imageURL: '',
              min: 0,
              max: 100,
              correct: 0,
              points: 1000,
              duration: 30,
            },
            {
              type: QuestionType.TypeAnswer,
              question: '',
              imageURL: '',
              correct: '',
              points: 1000,
              duration: 30,
            },
          ],
          null,
          2,
        ),
        newMode,
      )
    }
    if (newMode === GameMode.ZeroToOneHundred) {
      handleParseQuestionJson(
        JSON.stringify(
          [
            {
              type: QuestionType.Slider,
              question: '',
              imageURL: '',
              correct: 0,
              points: 1000,
              duration: 30,
            },
          ],
          null,
          2,
        ),
        newMode,
      )
    }
  }, [])

  useEffect(() => {
    handleChangeMode(GameMode.Classic)
  }, [handleChangeMode])

  const handleChangeJSON = (value: string) => {
    handleParseQuestionJson(value, mode)
  }

  const handleParseQuestionJson = (value: string, mode: GameMode) => {
    setQuestionsJson(value)
    setJsonError(undefined)

    /* eslint-disable-next-line */
    let parsedJson: any
    let jsonValid = true
    try {
      parsedJson = JSON.parse(value)
    } catch (error) {
      jsonValid = false
      setJsonError((error as Error).message)
    }

    if (jsonValid) {
      if (mode === GameMode.Classic) {
        let parsedQuestions: QuestionsForMode<GameMode.Classic> = []
        try {
          parsedQuestions = parseQuestionsJson(parsedJson, mode)
        } catch (error) {
          jsonValid = false
          setJsonError((error as Error).message)
          setClassicModeQuestions([])
        }
        if (parsedQuestions && jsonValid) {
          setClassicModeQuestions(parsedQuestions)
        }
      }
      if (mode === GameMode.ZeroToOneHundred) {
        let parsedQuestions: QuestionsForMode<GameMode.ZeroToOneHundred> = []
        try {
          parsedQuestions = parseQuestionsJson(parsedJson, mode)
        } catch (error) {
          jsonValid = false
          setJsonError((error as Error).message)
          setZeroToOneHundredModeQuestions([])
        }
        if (parsedQuestions && jsonValid) {
          setZeroToOneHundredModeQuestions(parsedQuestions)
        }
      }
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isValid) {
      const request: CreateGameRequestDto = {
        name,
        mode: mode,
        questions: [],
      }
      if (mode === GameMode.Classic && classicModeQuestions.length) {
        request.questions = classicModeQuestions
      }
      if (
        mode === GameMode.ZeroToOneHundred &&
        zeroToOneHundredModeQuestions.length
      ) {
        request.questions = zeroToOneHundredModeQuestions
      }

      createGame(request)
        .then((response) => {
          persistGameData(response.id, response.token)
          navigate(`/game?gameID=${response.id}`)
        })
        .catch(console.error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Page
        header={
          <IconButtonArrowRight
            id="create-game-button"
            type="submit"
            kind="secondary"
            size="small"
            value="Create Game"
            disabled={!isValid}
          />
        }>
        <div className={styles.details}>
          <TextField
            id="name-textfield"
            type="text"
            value={name}
            placeholder="Name"
            onChange={setName}
          />
          <Select
            id="game-mode-select"
            values={Object.entries(GameModeLabels).map(([key, value]) => ({
              key,
              value: key,
              valueLabel: value,
            }))}
            value={mode}
            onChange={(value) => handleChangeMode(value as GameMode)}
          />
        </div>
        <div className={styles.editor}>
          <Textarea
            id="json"
            name="json"
            value={questionsJson}
            onChange={handleChangeJSON}
          />
          {jsonError && <div className={styles.error}>{jsonError}</div>}
        </div>
      </Page>
    </form>
  )
}

export default CreateGamePage
