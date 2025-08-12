import React, { FC, useEffect, useMemo } from 'react'
import { useCountdown, useLocalStorage } from 'usehooks-ts'

import { Page, Typography } from '../../components'
import { REDIRECT_TARGET_HOST } from '../../utils/constants.ts'

type LegacyRedirectionPageProps = {
  /** Show UI but never navigate (useful for Storybook) */
  disableRedirect?: boolean
  /** Storybook-only helper: overrides localStorage('migrationToken') on first render */
  overrideMigrationToken?: string | undefined
}

const LegacyRedirectionPage: FC<LegacyRedirectionPageProps> = ({
  overrideMigrationToken,
  disableRedirect = false,
}) => {
  const [migrationToken] = useLocalStorage<string | undefined>(
    'migrationToken',
    overrideMigrationToken,
  )

  const redirectionLink = useMemo(() => {
    const searchParams = new URLSearchParams()

    if (migrationToken) {
      searchParams.set('migrationToken', migrationToken)
    }

    const searchParamString =
      searchParams.size > 0 ? `?${searchParams.toString()}` : ''

    return `https://${REDIRECT_TARGET_HOST}${searchParamString}`
  }, [migrationToken])

  const [count, { startCountdown }] = useCountdown({
    countStart: 10,
    intervalMs: 1000,
  })

  useEffect(() => {
    startCountdown()
  }, [startCountdown])

  useEffect(() => {
    if (count === 0) {
      console.log(`Redirecting to '${redirectionLink}'.`)
      if (!disableRedirect) {
        window.location.replace(redirectionLink)
      }
    }
  }, [count, disableRedirect, redirectionLink])

  return (
    <Page hideLogin>
      <Typography variant="title">We’ve moved—come with us!</Typography>

      <Typography variant="subtitle">
        Your new home is&nbsp;<strong>{REDIRECT_TARGET_HOST}</strong>
      </Typography>

      <Typography variant="text" size="medium">
        {migrationToken ? (
          <>We’ve saved your old profile and we’ll bring it along.</>
        ) : (
          <>Fresh start—no past activity found on this device.</>
        )}
      </Typography>

      <Typography variant="text" size="medium" aria-live="polite">
        Warping you over in&nbsp;<strong>{count}s</strong>…
      </Typography>

      <Typography variant="link" size="medium">
        <a href={redirectionLink} target="_blank" rel="noreferrer">
          Take me there now
        </a>
      </Typography>
    </Page>
  )
}

export default LegacyRedirectionPage
