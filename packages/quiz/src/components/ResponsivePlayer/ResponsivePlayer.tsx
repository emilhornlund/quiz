import React, { FC } from 'react'
import ReactPlayer from 'react-player'

import styles from './ResponsivePlayer.module.scss'

export interface ResponsivePlayerProps {
  url: string
  playing?: boolean
  grow?: boolean
}

const ResponsivePlayer: FC<ResponsivePlayerProps> = ({
  url,
  playing = true,
  grow = true,
}) => (
  <div className={styles.playerWrapper}>
    <ReactPlayer
      url={url}
      muted={false}
      width={grow ? '100%' : undefined}
      height={grow ? '100%' : undefined}
      playing={playing}
      loop
      controls
      stopOnUnmount
    />
  </div>
)

export default ResponsivePlayer
