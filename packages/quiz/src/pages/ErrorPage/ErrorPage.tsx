import { faHeartCrack } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC } from 'react'
import { useNavigate, useRouteError } from 'react-router-dom'

import { IconButtonArrowLeft, Page, Typography } from '../../components'

import styles from './ErrorPage.module.scss'

const ErrorPage: FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error: any = useRouteError()
  const navigate = useNavigate()

  return (
    <Page
      header={
        <IconButtonArrowLeft
          id="go-back"
          type="button"
          size="small"
          value="Go Back"
          onClick={() => {
            navigate(-1)
          }}
        />
      }>
      <div className={styles.errorIcon}>
        <FontAwesomeIcon icon={faHeartCrack} />
      </div>
      <Typography variant="title" size="medium">
        Oops! Something went wrong.
      </Typography>
      <Typography variant="subtitle" size="medium">
        {error?.statusText || 'An unexpected error occurred.'}
      </Typography>
      <Typography variant="text" size="medium">
        {error?.data ||
          'Please try refreshing the page or go back to the homepage.'}
      </Typography>
    </Page>
  )
}

export default ErrorPage
