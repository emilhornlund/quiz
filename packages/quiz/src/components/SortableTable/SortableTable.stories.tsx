import type { Meta, StoryObj } from '@storybook/react'

import SortableTable from './SortableTable'

const meta = {
  component: SortableTable,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SortableTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    values: [
      { id: 'value1', value: 'Value 1' },
      { id: 'value2', value: 'Value 2' },
      { id: 'value3', value: 'Value 3' },
      { id: 'value4', value: 'Value 4' },
    ],
  },
} satisfies Story
