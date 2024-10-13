import React from 'react'

import { classNames } from '../../utils/helpers.ts'
import { ConnectionStatus } from '../../utils/use-event-source.tsx'

import styles from './ConnectionStatusBanner.module.scss'

const classNameFromStatus: { [key in ConnectionStatus]: string } = {
  [ConnectionStatus.CONNECTED]: styles.success,
  [ConnectionStatus.RECONNECTING]: styles.warning,
  [ConnectionStatus.RECONNECTING_FAILED]: styles.error,
}

const messageFromStatus: { [key in ConnectionStatus]: string } = {
  [ConnectionStatus.CONNECTED]: 'Connected',
  [ConnectionStatus.RECONNECTING]: 'Reconnecting...',
  [ConnectionStatus.RECONNECTING_FAILED]: 'Reconnecting failed...',
}

export interface ConnectionStatusBannerProps {
  status: ConnectionStatus
}

const ConnectionStatusBanner: React.FC<ConnectionStatusBannerProps> = ({
  status,
}) => {
  const [show, setShow] = React.useState<boolean>(true)

  return (
    <div className={styles.connectionStatusBanner}>
      {show && (
        <button
          id="status"
          name="status"
          type="button"
          className={classNames(styles.banner, classNameFromStatus[status])}
          onClick={() => setShow(false)}>
          {messageFromStatus[status]}
        </button>
      )}
    </div>
  )
}

export default ConnectionStatusBanner
