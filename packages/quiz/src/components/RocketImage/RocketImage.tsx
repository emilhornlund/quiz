import React, { FC } from 'react'

import Rocket from '../../assets/images/rocket.svg'

import styles from './RocketImage.module.scss'

const RocketImage: FC = () => (
  <div className={styles.main}>
    <img src={Rocket} alt="rocket" />
  </div>
)

export default RocketImage
