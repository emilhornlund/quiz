import React, { FC } from 'react'

import styles from './NicknameChip.module.scss'

export interface NicknameChipProps {
  value: string
}

const NicknameChip: FC<NicknameChipProps> = ({ value }) => (
  <div className={styles.main}>{value}</div>
)

export default NicknameChip
