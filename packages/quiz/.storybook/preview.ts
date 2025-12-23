import { Preview } from '@storybook/react'

import '../src/styles/fonts.scss'
import '../src/styles/index.css'
import './storybook.styles.css'

/** @type { import('@storybook/react').Preview } */
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      values: [
        {
          name: 'default',
          value: 'linear-gradient(180deg, #575fcf 25%, 75%, #3c40c6)',
        },
      ],
      default: 'default',
    },
  },
}

export default preview
