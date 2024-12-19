import { useQuery } from '@tanstack/react-query'
import React, { FC, FormEvent } from 'react'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { Button, Page, TextField, Typography } from '../../components'

import styles from './PlayerLinkPage.module.scss'

const PlayerLinkPage: FC = () => {
  const { getLinkCode, linkPlayer } = useQuizServiceClient()

  const [editableLinkCode, setEditableLinkCode] = React.useState<string>()

  const { data: { code } = {} } = useQuery({
    queryKey: ['linkCode'],
    queryFn: getLinkCode,
    cacheTime: 10 * 60 * 1000,
    staleTime: 10 * 60 * 1000,
  })

  const handleLinkPlayerSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (editableLinkCode) {
      linkPlayer(editableLinkCode).then()
    }
  }

  return (
    <Page>
      <div className={styles.linkPage}>
        <Typography variant="subtitle">Link Your Devices!</Typography>
        <Typography variant="text">
          Ready to link your player across your devices? Use this magical code
          to connect your player from one device to another.
        </Typography>
        {code && <div className={styles.linkCode}>{code}</div>}

        <div className={styles.divider} />

        <Typography variant="text">
          Want to link your devices? Simply enter the code below to get started.
        </Typography>

        <form onSubmit={handleLinkPlayerSubmit}>
          <TextField
            id="link-code-textfield"
            type="text"
            placeholder="Enter Link Code"
            onChange={(value) => setEditableLinkCode(value as string)}
          />
          <Button
            id="link-player-button"
            type="submit"
            kind="call-to-action"
            value="Link Me Up!"
          />
        </form>
      </div>
    </Page>
  )
}

export default PlayerLinkPage
