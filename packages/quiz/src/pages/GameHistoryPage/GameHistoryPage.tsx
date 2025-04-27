import React, { FC } from 'react'

import GameHistoryPageUI from './GameHistoryPageUI'

const GameHistoryPage: FC = () => {
  return (
    <GameHistoryPageUI
      items={[]}
      total={0}
      limit={0}
      offset={0}
      onChangePagination={() => undefined}
    />
  )
}

export default GameHistoryPage
