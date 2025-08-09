import React, { FC } from 'react'
import { useLocalStorage } from 'usehooks-ts'

import { useAuthContext } from '../../context/auth'

import { LegacyInfoCardUI } from './components'

const LEGACY_DOMAIN = 'quiz.emilhornlund.com'
const TARGET_DOMAIN = 'klurigo.com'

const LegacyInfoCard: FC = () => {
  const { isUserAuthenticated } = useAuthContext()

  const [migrated] = useLocalStorage<boolean>('migrated', false)
  const [migrationToken] = useLocalStorage<string | undefined>(
    'migrationToken',
    undefined,
  )
  const [dismissMigrationInfoDialog, setDismissMigrationInfoDialog] =
    useLocalStorage<boolean>('dismissMigrationInfoDialog', false)

  if (
    dismissMigrationInfoDialog ||
    migrated ||
    (!!migrationToken && isUserAuthenticated)
  ) {
    return null
  }

  const handleDismiss = () => {
    setDismissMigrationInfoDialog(true)
  }

  return (
    <LegacyInfoCardUI
      migrated={!!migrationToken}
      legacyDomain={LEGACY_DOMAIN}
      targetDomain={TARGET_DOMAIN}
      onDismiss={handleDismiss}
    />
  )
}

export default LegacyInfoCard
