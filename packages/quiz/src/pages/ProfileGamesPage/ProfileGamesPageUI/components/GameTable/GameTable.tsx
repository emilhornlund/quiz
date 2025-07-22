import {
  faClock,
  faGamepad,
  faPlayCircle,
  faStar,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GameHistoryDto, GameParticipantType, GameStatus } from '@quiz/common'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import React, { FC, MouseEvent } from 'react'

import Picture from '../../../../../assets/images/picture.svg'
import {
  Badge,
  getBadgePositionBackgroundColor,
} from '../../../../../components'
import { GameModeLabels } from '../../../../../models'
import colors from '../../../../../styles/colors.module.scss'
import { formatTimeAgo } from '../../../../../utils/date.utils.ts'

import styles from './GameTable.module.scss'

export type GameTableItemProps = {
  values: GameHistoryDto
  onClick: (id: string, status: GameStatus) => void
}

const GameTableItem: FC<GameTableItemProps> = ({ values, onClick }) => {
  const { id, name, mode, status, imageCoverURL, created } = values

  const handleClick = (event: MouseEvent) => {
    event.preventDefault()
    onClick(id, status)
  }

  return (
    <button onClick={handleClick} className={styles.row}>
      {' '}
      <img
        src={imageCoverURL ?? Picture}
        className={imageCoverURL ? undefined : styles.placeholder}
        alt="image"
      />
      <div className={styles.metadata}>
        <div className={styles.name}>{name}</div>
        <div className={styles.details}>
          <span>
            <FontAwesomeIcon icon={faGamepad} color={colors.gray2} />
            {GameModeLabels[mode]}
          </span>
          <span title={format(toZonedTime(created, 'UTC'), 'y-LL-dd HH:mm:ss')}>
            <FontAwesomeIcon icon={faClock} color={colors.gray2} />
            {formatTimeAgo(created)}
          </span>
        </div>
      </div>
      {status == GameStatus.Active && (
        <div className={styles.active}>
          <FontAwesomeIcon icon={faPlayCircle} color={colors.white} />
          Ongoing...
        </div>
      )}
      {values.participantType === GameParticipantType.HOST &&
        status == GameStatus.Completed && (
          <div className={styles.host}>
            <FontAwesomeIcon icon={faUserTie} color={colors.white} />
            Host
          </div>
        )}
      {values.participantType === GameParticipantType.PLAYER &&
        status === GameStatus.Completed && (
          <div className={styles.stats}>
            <div className={styles.score}>
              <FontAwesomeIcon icon={faStar} className={styles.icon} />
              {values.score}
            </div>
            <Badge
              backgroundColor={getBadgePositionBackgroundColor(values.rank)}
              size="small">
              {values.rank}
            </Badge>
          </div>
        )}
    </button>
  )
}

export interface GameTableProps {
  items: GameHistoryDto[]
  onClick: (id: string, status: GameStatus) => void
}

const GameTable: FC<GameTableProps> = ({ items, onClick }) => {
  return (
    <div className={styles.gameTable}>
      <div className={styles.rows}>
        {items.map((item) => (
          <GameTableItem
            key={`game-table-item-${item.id}`}
            values={item}
            onClick={onClick}
          />
        ))}
      </div>
    </div>
  )
}

export default GameTable
