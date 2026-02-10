import type { Meta, StoryObj } from '@storybook/react'
import { type FC, useState } from 'react'

import Switch, { type SwitchProps } from './Switch'

const SwitchStoryComponent: FC<SwitchProps> = (props) => {
  const [value, setValue] = useState<boolean>(false)

  return <Switch {...props} value={value} onChange={setValue} />
}

const meta = {
  title: 'Inputs/Switch',
  component: Switch,
  tags: ['autodocs'],
  render: (props) => <SwitchStoryComponent {...props} />,
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    id: 'my-switch',
    label: 'Switch Label',
  },
} satisfies Story

export const NoLabel = {
  name: 'No Label',
  args: {
    id: 'my-switch',
  },
} satisfies Story
