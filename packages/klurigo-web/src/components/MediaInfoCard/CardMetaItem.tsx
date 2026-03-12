import type { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { FC, ReactNode } from 'react'

import styles from './MediaInfoCard.module.scss'

/**
 * Props for the CardMetaItem component.
 */
export type CardMetaItemProps = {
  /** Optional icon displayed before the content. */
  readonly icon?: IconDefinition
  /** Optional color applied to the icon. */
  readonly iconColor?: string
  /** Optional text color applied to the item content. */
  readonly textColor?: string
  /** Optional tooltip text shown on hover. */
  readonly title?: string
  /** Content rendered inside the metadata item. */
  readonly children: ReactNode
  /** Optional test id for the rendered element. */
  readonly 'data-testid'?: string
}

/**
 * Renders a metadata item for use inside the meta section of a media info card.
 */
const CardMetaItem: FC<CardMetaItemProps> = ({
  icon,
  iconColor,
  textColor,
  title,
  children,
  'data-testid': dataTestId,
}) => {
  return (
    <span
      className={styles.metaItem}
      title={title}
      style={{ color: textColor ? textColor : undefined }}
      data-testid={dataTestId}>
      {icon && <FontAwesomeIcon icon={icon} color={iconColor} />}
      {children}
    </span>
  )
}

export default CardMetaItem
