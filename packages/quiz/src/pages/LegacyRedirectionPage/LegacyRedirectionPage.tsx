import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import React, { FC, useCallback, useEffect, useMemo } from 'react'
import { useCountdown, useLocalStorage } from 'usehooks-ts'

import { Button, Page, Typography } from '../../components'
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

  const handleRedirection = useCallback(() => {
    if (!disableRedirect) {
      console.log(`Redirecting to '${redirectionLink}'.`)
      window.location.replace(redirectionLink)
    }
  }, [disableRedirect, redirectionLink])

  useEffect(() => {
    if (count === 0) {
      handleRedirection()
    }
  }, [count, handleRedirection])

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

      <Button
        id="redirect-button"
        type="button"
        kind="call-to-action"
        icon={faPaperPlane}
        iconPosition="leading"
        onClick={handleRedirection}>
        Take Me There Now!
      </Button>
    </Page>
  )
}

export default LegacyRedirectionPage
