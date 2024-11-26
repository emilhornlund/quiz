import React, { FC } from 'react'
import ReactPlayer from 'react-player'

import styles from './ResponsivePlayer.module.scss'

const ResponsivePlayer: FC<{ url: string }> = ({ url }) => (
  <div className={styles.playerWrapper}>
    <ReactPlayer
      url={url}
      muted={false}
      width="100%"
      height="100%"
      playing
      loop
      controls
      stopOnUnmount
    />
  </div>
)

export default ResponsivePlayer
