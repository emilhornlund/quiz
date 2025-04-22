import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC, useState } from 'react'

import {
  CircularProgressBar,
  CircularProgressBarKind,
  CircularProgressBarSize,
} from '../../../../../../../components'
import { classNames } from '../../../../../../../utils/helpers.ts'
import styles from '../../../GameResultsPageUI.module.scss'

export interface TableItem {
  badge: number
  value: string
  progress: number
  details?: {
    title: string
    value: string | number
    icon?: IconDefinition
    iconColor?: string
  }[]
}

export interface GameResultTableProps {
  items: TableItem[]
}

const TableRow: FC<TableItem> = ({ badge, value, progress, details }) => {
  const [showDetails, setShowDetails] = useState<boolean>(false)

  return (
    <div
      key={`${badge}`}
      className={styles.tableRow}
      onClick={(event) => {
        event.preventDefault()
        setShowDetails(!showDetails)
      }}>
      <div className={styles.main}>
        <div className={styles.badge}>{`${badge}`}</div>
        <div className={styles.value} title={value}>
          {value}
        </div>
        <div>
          <CircularProgressBar
            progress={progress}
            kind={CircularProgressBarKind.Correct}
            size={CircularProgressBarSize.Small}
          />
        </div>
        <div>
          <FontAwesomeIcon icon={faChevronDown} color="black" />
        </div>
      </div>
      <div
        className={classNames(
          styles.details,
          showDetails ? styles.active : undefined,
        )}>
        {details?.map((item) => (
          <div key={item.title} className={styles.item}>
            <div className={styles.title}>
              {item.icon && (
                <FontAwesomeIcon icon={item.icon} color={item.iconColor} />
              )}
              {item.title}
            </div>
            <div className={styles.value}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const GameResultTable: FC<GameResultTableProps> = ({ items }) => {
  return (
    <div className={styles.table}>
      {items.map((metric, index) => (
        <TableRow key={index} {...metric} />
      ))}
    </div>
  )
}

export default GameResultTable
