import type { FC } from 'react'

import type { PageProps } from '../../../components'
import { Page } from '../../../components'

const GamePage: FC<PageProps> = ({ header, children, ...rest }) => (
  <Page header={header} hideLogin {...rest}>
    {children}
  </Page>
)

export default GamePage
