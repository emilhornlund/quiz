import {
  faClock,
  faGamepad,
  faImage,
  faPlayCircle,
  faRankingStar,
  faStar,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { GameHistoryDto } from '@klurigo/common'
import { GameParticipantType, GameStatus } from '@klurigo/common'
import type { FC } from 'react'

import ResponsiveImage from '../../../../../../components/ResponsiveImage'
import { GameModeLabels } from '../../../../../../models'
import {
  DATE_FORMATS,
  formatLocalDate,
  formatTimeAgo,
} from '../../../../../../utils/date.utils'
import { classNames } from '../../../../../../utils/helpers'

import styles from './ProfileGameCard.module.scss'

/**
 * Props for the ProfileGameCard component.
 */
export type ProfileGameCardProps = {
  /** The game history entry to display in the card. */
  readonly game: GameHistoryDto
  /** Callback invoked when the card is activated. */
  readonly onClick: (id: string, status: GameStatus) => void
}

/**
 * Renders a compact game card for use in the profile games page.
 *
 * Displays a cover image (with SVG fallback), game name, score and rank for
 * completed player games, a host badge for host games, an ongoing indicator
 * for active games, and metadata (game mode + date played) at the bottom.
 */
const ProfileGameCard: FC<ProfileGameCardProps> = ({ game, onClick }) => {
  const handleClick = (): void => {
    onClick(game.id, game.status)
  }

  const isActive = game.status === GameStatus.Active
  const isCompletedPlayer =
    game.status === GameStatus.Completed &&
    game.participantType === GameParticipantType.PLAYER
  const isCompletedHost =
    game.status === GameStatus.Completed &&
    game.participantType === GameParticipantType.HOST

  return (
    <button
      type="button"
      className={styles.card}
      onClick={handleClick}
      data-testid="profile-game-card">
      <div className={styles.cover}>
        {game.imageCoverURL ? (
          <ResponsiveImage
            imageURL={game.imageCoverURL}
            alt={game.name}
            fit="fill"
            noCornerRadius
            noBorder
          />
        ) : (
          <div className={styles.coverFallback} data-testid="cover-fallback">
            <FontAwesomeIcon icon={faImage} />
          </div>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title} title={game.name}>
          {game.name}
        </h3>
        {isActive && (
          <div className={styles.info}>
            <span
              className={classNames(styles.item, styles.active)}
              data-testid="info-active">
              <FontAwesomeIcon icon={faPlayCircle} />
              Ongoing
            </span>
          </div>
        )}
        {isCompletedHost && (
          <div className={styles.info}>
            <span
              className={classNames(styles.item, styles.host)}
              data-testid="info-host">
              <FontAwesomeIcon icon={faUserTie} />
              Host
            </span>
          </div>
        )}
        {isCompletedPlayer && (
          <div className={styles.info}>
            <span
              className={classNames(styles.item, styles.rank)}
              data-testid="info-rank">
              <FontAwesomeIcon icon={faRankingStar} />
              {game.rank}
            </span>
            <span
              className={classNames(styles.item, styles.score)}
              data-testid="info-score">
              <FontAwesomeIcon icon={faStar} />
              {game.score}
            </span>
          </div>
        )}
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <FontAwesomeIcon icon={faGamepad} />
            {GameModeLabels[game.mode]}
          </span>
          <span
            className={styles.metaItem}
            title={formatLocalDate(
              game.created,
              DATE_FORMATS.DATE_TIME_SECONDS,
            )}>
            <FontAwesomeIcon icon={faClock} />
            {formatTimeAgo(game.created)}
          </span>
        </div>
      </div>
    </button>
  )
}

export default ProfileGameCard
