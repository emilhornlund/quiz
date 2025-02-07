import {
  faCircleQuestion,
  faEye,
  faGamepad,
  faLanguage,
  faPen,
  faPlay,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  GameMode,
  LanguageCode,
  QuizAuthorResponseDto,
  QuizVisibility,
} from '@quiz/common'
import React, { FC, useMemo, useState } from 'react'

import Picture from '../../assets/images/picture.svg'
import {
  GameModeLabels,
  LanguageLabels,
  QuizVisibilityLabels,
} from '../../models/labels.ts'
import { DeviceType, useDeviceSizeType } from '../../utils/use-device-size.tsx'
import Button, { IconButtonArrowLeft, IconButtonArrowRight } from '../Button'
import { ConfirmDialog } from '../index.ts'

import styles from './QuizTable.module.scss'

export interface QuizTableItem {
  id: string
  title: string
  description?: string
  mode: GameMode
  visibility: QuizVisibility
  imageCoverURL?: string
  languageCode: LanguageCode
  numberOfQuestions: number
  author: QuizAuthorResponseDto
}

export interface QuizTablePagination {
  total: number
  limit: number
  offset: number
}

export interface QuizTableProps {
  items: QuizTableItem[]
  pagination: QuizTablePagination
  isHostingGame?: boolean
  playerId?: string
  onEdit?: (id: string) => void
  onHostGame?: (id: string) => void
  onPagination?: (limit: number, offset: number) => void
}

const QuizTable: FC<QuizTableProps> = ({
  items,
  pagination,
  isHostingGame = false,
  playerId,
  onEdit,
  onHostGame,
  onPagination,
}) => {
  const deviceType = useDeviceSizeType()

  const [hostGameId, setHostGameId] = useState<string>()

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(pagination.total / pagination.limit)),
    [pagination],
  )
  const currentPage = useMemo(
    () => Math.max(1, Math.floor(pagination.offset / pagination.limit) + 1),
    [pagination],
  )

  return (
    <>
      <div className={styles.quizTable}>
        <div className={styles.rows}>
          {items.map((item) => (
            <div key={item.id} className={styles.row}>
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
                    <FontAwesomeIcon icon={faEye} />
                    {QuizVisibilityLabels[item.visibility]}
                  </span>
                  <span>
                    <FontAwesomeIcon icon={faLanguage} />
                    {LanguageLabels[item.languageCode]}
                  </span>
                  <span>
                    <FontAwesomeIcon icon={faGamepad} />
                    {GameModeLabels[item.mode]}
                  </span>
                  <span>
                    <FontAwesomeIcon icon={faCircleQuestion} />
                    {item.numberOfQuestions}
                  </span>
                </div>
              </div>
              <div className={styles.actions}>
                {playerId === item.author.id && (
                  <Button
                    id="edit-quiz-button"
                    type="button"
                    kind="call-to-action"
                    size="small"
                    value={deviceType != DeviceType.Mobile && 'Edit'}
                    icon={faPen}
                    onClick={() => onEdit?.(item.id)}
                  />
                )}
                <Button
                  id="host-game-button"
                  type="button"
                  kind="call-to-action"
                  size="small"
                  value={deviceType != DeviceType.Mobile && 'Host Game'}
                  icon={faPlay}
                  onClick={() => setHostGameId(item.id)}
                />
              </div>
            </div>
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
      <ConfirmDialog
        title="Host Game"
        message="Are you sure you want to start hosting a new game? Players will be able to join as soon as the game starts."
        open={!!hostGameId}
        loading={isHostingGame}
        onConfirm={() => !!hostGameId && onHostGame?.(hostGameId)}
        onClose={() => setHostGameId(undefined)}
      />
    </>
  )
}

export default QuizTable
