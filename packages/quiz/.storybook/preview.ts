import { Preview } from '@storybook/react'

import '../src/styles/index.css'

/** @type { import('@storybook/react').Preview } */
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ['autodocs'],
}

export default preview
