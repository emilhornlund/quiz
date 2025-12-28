import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { FC } from 'react'
import { Link } from 'react-router-dom'

import { Badge, LoadingSpinner, Page, Typography } from '../../../../components'

export interface AuthVerifyPageUIProps {
  verified: boolean
  loggedIn: boolean
  error?: boolean
}

const AuthVerifyPageUI: FC<AuthVerifyPageUIProps> = ({
  verified,
  loggedIn,
  error,
}) => {
  return (
    <Page>
      {verified && !error && (
        <>
          <Badge size="large" backgroundColor="green">
            <FontAwesomeIcon icon={faCheck} />
          </Badge>

          <Typography variant="title" size="medium">
            Hooray! Your email’s all set!
          </Typography>

          <Typography variant="text" size="medium">
            Welcome aboard the fun train. Let’s roll!
          </Typography>

          {loggedIn ? (
            <Link to={'/'}>
              <Typography variant="link" size="small">
                Take me home
              </Typography>
            </Link>
          ) : (
            <Link to={'/auth/login'}>
              <Typography variant="link" size="small">
                Log in to get started!
              </Typography>
            </Link>
          )}
        </>
      )}

      {!verified && !error && (
        <>
          <Typography variant="title" size="medium">
            One moment… verifying your magic link!
          </Typography>

          <LoadingSpinner />

          <Typography variant="text" size="small">
            Good things come to those who wait!
          </Typography>
        </>
      )}

      {error && (
        <>
          <Badge size="large" backgroundColor="red">
            <FontAwesomeIcon icon={faXmark} />
          </Badge>

          <Typography variant="title" size="medium">
            Oops! Something went wrong.
          </Typography>

          <Typography variant="text" size="medium">
            The supplied link is invalid or has expired.
          </Typography>
        </>
      )}
    </Page>
  )
}

export default AuthVerifyPageUI
