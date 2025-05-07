import { faMaximize, faMinimize } from '@fortawesome/free-solid-svg-icons'
import React, { FC } from 'react'

import { Button, Page, PageProps } from '../../../components'
import { useGameContext } from '../../../context/game'

const GamePage: FC<PageProps> = ({ header, children, ...rest }) => {
  const { isFullscreenActive, toggleFullscreen } = useGameContext()

  return (
    <Page
      header={
        <>
          <Button
            id="fullscreen-button"
            type="button"
            kind="primary"
            size="small"
            icon={isFullscreenActive ? faMinimize : faMaximize}
            onClick={() => toggleFullscreen().then()}
          />
          {header}
        </>
      }
      {...rest}>
      {children}
    </Page>
  )
}

export default GamePage
