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
import React, { FC, useMemo } from 'react'
import { Link } from 'react-router-dom'

import Picture from '../../../../../assets/images/picture.svg'
import {
  Badge,
  getBadgePositionBackgroundColor,
} from '../../../../../components'
import { GameModeLabels } from '../../../../../models'
import colors from '../../../../../styles/colors.module.scss'
import { formatTimeAgo } from '../../../../../utils/date.utils.ts'

import styles from './GameTable.module.scss'

export type GameTableItemProps = GameHistoryDto

const GameTableItem: FC<GameTableItemProps> = (props) => {
  const { id, name, mode, status, imageCoverURL, created } = props

  const link = useMemo(
    () =>
      status === GameStatus.Completed
        ? `/game/results/${id}`
        : `/game?gameID=${id}`,
    [id, status],
  )

  return (
    <Link to={link} className={styles.row}>
      <img src={imageCoverURL ?? Picture} className={styles.svg} alt="image" />
      <div className={styles.metadata}>
        <div className={styles.name}>{name}</div>
        <div className={styles.details}>
          <span>
            <FontAwesomeIcon icon={faGamepad} color={colors.gray2} />
            {GameModeLabels[mode]}
          </span>
          <span title={format(created, 'y-LL-dd HH:mm:ss')}>
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
      {props.participantType === GameParticipantType.HOST &&
        status == GameStatus.Completed && (
          <div className={styles.host}>
            <FontAwesomeIcon icon={faUserTie} color={colors.white} />
            Host
          </div>
        )}
      {props.participantType === GameParticipantType.PLAYER &&
        status === GameStatus.Completed && (
          <div className={styles.stats}>
            <div className={styles.score}>
              <FontAwesomeIcon icon={faStar} className={styles.icon} />
              {props.score}
            </div>
            <Badge
              backgroundColor={getBadgePositionBackgroundColor(props.rank)}
              size="small">
              {props.rank}
            </Badge>
          </div>
        )}
    </Link>
  )
}

export interface GameTableProps {
  items: GameHistoryDto[]
}

const GameTable: FC<GameTableProps> = ({ items }) => {
  return (
    <div className={styles.gameTable}>
      <div className={styles.rows}>
        {items.map((item) => (
          <GameTableItem key={`game-table-item-${item.id}`} {...item} />
        ))}
      </div>
    </div>
  )
}

export default GameTable
