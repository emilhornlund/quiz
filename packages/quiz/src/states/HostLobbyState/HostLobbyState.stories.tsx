import { GameEventType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import type { FC } from 'react'
import { useMemo, useState } from 'react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { v4 as uuidv4 } from 'uuid'

import type { GameContextType } from '../../context/game'
import { GameContext } from '../../context/game'

import HostLobbyState, { type HostLobbyStateProps } from './HostLobbyState'

const HostLobbyStateComponent: FC<HostLobbyStateProps> = (props) => {
  const [players, setPlayers] = useState<
    {
      id: string
      nickname: string
    }[]
  >(props.event.players)

  const addPlayer = () => {
    setPlayers([
      ...players,
      { id: uuidv4(), nickname: `Player${players.length}` },
    ])
  }

  const contextValue = useMemo(
    () =>
      ({
        gameID: uuidv4(),
        leaveGame: async (playerID: string): Promise<void> => {
          setPlayers((prev) => prev.filter((player) => player.id !== playerID))
        },
      }) as GameContextType,
    [],
  )

  return (
    <div>
      <GameContext.Provider value={contextValue}>
        <HostLobbyState {...props} event={{ ...props.event, players }} />
      </GameContext.Provider>
      <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
        <button onClick={addPlayer}>Simulate Participant Joining</button>
      </div>
    </div>
  )
}

const meta = {
  component: HostLobbyState,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
  render: (props) => <HostLobbyStateComponent {...props} />,
} satisfies Meta<typeof HostLobbyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    event: {
      type: GameEventType.GameLobbyHost,
      game: { id: 'de6f4af5-f472-4e30-bbeb-97b881e0a569', pin: '123456' },
      players: [
        { id: uuidv4(), nickname: 'ShadowCyborg' },
        { id: uuidv4(), nickname: 'Radar' },
        { id: uuidv4(), nickname: 'ShadowWhirlwind' },
        { id: uuidv4(), nickname: 'WhiskerFox' },
        { id: uuidv4(), nickname: 'JollyNimbus' },
        { id: uuidv4(), nickname: 'PuddingPop' },
        { id: uuidv4(), nickname: 'MysticPine' },
        { id: uuidv4(), nickname: 'FrostyBear' },
        { id: uuidv4(), nickname: 'Willo' },
        { id: uuidv4(), nickname: 'ScarletFlame' },
      ],
    },
  },
} satisfies Story
