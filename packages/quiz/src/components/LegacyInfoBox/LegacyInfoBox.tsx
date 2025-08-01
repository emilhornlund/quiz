import React, { FC } from 'react'

import styles from './LegacyInfoBox.module.scss'

const LEGACY_DOMAIN = 'quiz.emilhornlund.com'
const TARGET_DOMAIN = 'klurigo.com'

const LegacyInfoBox: FC = () => (
  <div className={styles.legacyInfoBox}>
    Hey quiz champion! Did your brainy adventures happen on{' '}
    <a href={`https://${LEGACY_DOMAIN}`}>{LEGACY_DOMAIN}</a>? No worries— we can
    save all your quiz creations and epic game stats! Just pop back to{' '}
    <a href={`https://${LEGACY_DOMAIN}`}>{LEGACY_DOMAIN}</a> one last time, and
    we’ll magically teleport everything over to <span>{TARGET_DOMAIN}</span>.
    Ready to blast off your data?
  </div>
)

export default LegacyInfoBox
