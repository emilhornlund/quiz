import { useCallback, useMemo, useState } from 'react'

import {
  QuizSettingsData,
  QuizSettingsDataSourceValidationModel,
  QuizSettingsDataSourceValidChangeFunction,
  QuizSettingsDataSourceValueChangeFunction,
} from './quiz-settings-data-source.types.ts'

type QuizSettingsDataSourceReturnType = {
  values: Partial<QuizSettingsData>
  valid: boolean
  setValues: (values: QuizSettingsData) => void
  onValueChange: QuizSettingsDataSourceValueChangeFunction
  onValidChange: QuizSettingsDataSourceValidChangeFunction
}

export const useQuizSettingsDataSource =
  (): QuizSettingsDataSourceReturnType => {
    const [model, setModel] = useState<QuizSettingsDataSourceValidationModel>({
      data: {},
      validation: {
        title: false,
      },
    })

    const values = useMemo<Partial<QuizSettingsData>>(() => model.data, [model])

    const valid = useMemo(
      () => Object.values(model.validation).every((valid) => !!valid),
      [model],
    )

    const setValues = useCallback((values: QuizSettingsData) => {
      setModel({
        data: values,
        validation: {},
      })
    }, [])

    const onValueChange = useCallback(
      <K extends keyof QuizSettingsData>(
        key: K,
        value?: QuizSettingsData[K],
      ) => {
        setModel((prevModel) => {
          const data = prevModel.data
          data[key] = value
          return { ...prevModel, data }
        })
      },
      [],
    )

    const onValidChange = useCallback(
      <K extends keyof QuizSettingsData>(key: K, valid: boolean) => {
        setModel((prevModel) => {
          const validation = prevModel.validation
          validation[key] = valid
          return { ...prevModel, validation }
        })
      },
      [],
    )

    return { values, setValues, valid, onValueChange, onValidChange }
  }
