import {
  faCircleQuestion,
  faEye,
  faGamepad,
  faIcons,
  faLanguage,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  GameMode,
  LanguageCode,
  QuizAuthorResponseDto,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import React, { FC, MouseEvent, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import Picture from '../../assets/images/picture.svg'
import {
  GameModeLabels,
  LanguageLabels,
  QuizCategoryLabels,
  QuizVisibilityLabels,
} from '../../models'
import { IconButtonArrowLeft, IconButtonArrowRight } from '../Button'

import styles from './QuizTable.module.scss'

export interface QuizTableItem {
  id: string
  title: string
  description?: string
  mode: GameMode
  visibility: QuizVisibility
  category: QuizCategory
  imageCoverURL?: string
  languageCode: LanguageCode
  numberOfQuestions: number
  author: QuizAuthorResponseDto
  updated: Date
}

export interface QuizTablePagination {
  total: number
  limit: number
  offset: number
}

export interface QuizTableProps {
  items: QuizTableItem[]
  pagination: QuizTablePagination
  isPublic?: boolean
  onPagination?: (limit: number, offset: number) => void
}

const QuizTable: FC<QuizTableProps> = ({
  items,
  pagination,
  isPublic = false,
  onPagination,
}) => {
  const navigate = useNavigate()

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(pagination.total / pagination.limit)),
    [pagination],
  )
  const currentPage = useMemo(
    () => Math.max(1, Math.floor(pagination.offset / pagination.limit) + 1),
    [pagination],
  )

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const id = event.currentTarget.id
    if (id) {
      navigate(`/quiz/details/${id}`)
    }
  }

  return (
    <>
      <div className={styles.quizTable}>
        <div className={styles.rows}>
          {items.map((item) => (
            <button
              key={item.id}
              id={item.id}
              onClick={handleClick}
              className={styles.row}>
              <img
                src={item.imageCoverURL ?? Picture}
                className={item.imageCoverURL ? undefined : styles.svg}
                alt="image"
              />
              <div className={styles.content}>
                <div className={styles.title}>{item.title}</div>
                {item.description && (
                  <div title={item.description} className={styles.description}>
                    {item.description}
                  </div>
                )}
                <div className={styles.details}>
                  <span>
                    <FontAwesomeIcon icon={faGamepad} />
                    {GameModeLabels[item.mode]}
                  </span>
                  <span>
                    <FontAwesomeIcon icon={faIcons} />
                    {QuizCategoryLabels[item.category]}
                  </span>
                  {!isPublic && (
                    <span>
                      <FontAwesomeIcon icon={faEye} />
                      {QuizVisibilityLabels[item.visibility]}
                    </span>
                  )}
                  <span>
                    <FontAwesomeIcon icon={faLanguage} />
                    {LanguageLabels[item.languageCode]}
                  </span>
                  <span>
                    <FontAwesomeIcon icon={faCircleQuestion} />
                    {item.numberOfQuestions}{' '}
                    {item.numberOfQuestions === 1 ? 'Question' : 'Questions'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.navigation}>
              <IconButtonArrowLeft
                id="prev-page-button"
                type="button"
                kind="primary"
                size="normal"
                disabled={currentPage === 1}
                onClick={() =>
                  onPagination?.(
                    pagination.limit,
                    Math.max(0, pagination.offset - pagination.limit),
                  )
                }
              />
            </div>
            <div className={styles.page}>
              Page {currentPage} of {totalPages}
            </div>
            <div className={styles.navigation}>
              <IconButtonArrowRight
                id="next-page-button"
                type="button"
                kind="primary"
                size="normal"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  onPagination?.(
                    pagination.limit,
                    Math.min(
                      pagination.total,
                      pagination.offset + pagination.limit,
                    ),
                  )
                }
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default QuizTable
