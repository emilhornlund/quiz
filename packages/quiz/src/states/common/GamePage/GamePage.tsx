import { faMaximize, faMinimize } from '@fortawesome/free-solid-svg-icons'
import React, { FC } from 'react'

import { Button, Page, PageProps } from '../../../components'
import { useGameContext } from '../../../context/game'
import {
  DeviceType,
  useDeviceSizeType,
} from '../../../utils/use-device-size.tsx'

const GamePage: FC<PageProps> = ({ header, children, ...rest }) => {
  const { isFullscreenActive, toggleFullscreen } = useGameContext()
  const deviceType = useDeviceSizeType()

  return (
    <Page
      header={
        <>
          {deviceType !== DeviceType.Mobile && (
            <Button
              id="fullscreen-button"
              type="button"
              kind="primary"
              size="small"
              icon={isFullscreenActive ? faMinimize : faMaximize}
              onClick={() => toggleFullscreen().then()}
            />
          )}
          {header}
        </>
      }
      {...rest}>
      {children}
    </Page>
  )
}

export default GamePage
