import React, { FC } from 'react'

import Card from '../../../Card'

export interface LegacyInfoCardUIProps {
  migrated: boolean
  legacyDomain?: string
  targetDomain?: string
  onDismiss: () => void
}

const LegacyInfoCardUI: FC<LegacyInfoCardUIProps> = ({
  migrated,
  legacyDomain,
  targetDomain,
  onDismiss,
}) => (
  <Card
    kind={migrated ? 'success' : 'call-to-action'}
    size="large"
    onDismiss={onDismiss}
    center>
    <span>
      {migrated ? (
        <>
          Your migration’s all set! Pop in or make a fresh account, and we’ll
          take it from here.
        </>
      ) : (
        <>
          Hey quiz champion! Did your brainy adventures happen on{' '}
          <a href={`https://${legacyDomain}`}>{legacyDomain}</a>? No worries— we
          can save all your quiz creations and epic game stats! Just pop back to{' '}
          <a href={`https://${legacyDomain}`}>{legacyDomain}</a> one last time,
          and we’ll magically teleport everything over to{' '}
          <b>
            <i>{targetDomain}</i>
          </b>
          . Ready to blast off your data?
        </>
      )}
    </span>
  </Card>
)

export default LegacyInfoCardUI
