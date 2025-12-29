import type { Meta, StoryObj } from '@storybook/react'
import { useRef, useState } from 'react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { Menu, MenuItem } from './Menu'

const MenuWithButton: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const toggleMenu = () => setMenuOpen((prev) => !prev)

  return (
    <div>
      <button ref={buttonRef} onClick={toggleMenu}>
        Open Menu
      </button>
      <Menu
        anchorRef={buttonRef}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}>
        <MenuItem>Option 1</MenuItem>
        <MenuItem>Option 1</MenuItem>
        <MenuItem>Option 1</MenuItem>
      </Menu>
    </div>
  )
}

const meta = {
  component: Menu,
  decorators: [withRouter, (Story) => <Story />],
  args: {
    anchorRef: undefined,
    isOpen: false,
    onClose: () => undefined,
    children: undefined,
  },
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <MenuWithButton />,
}
