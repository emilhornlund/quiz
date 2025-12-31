import type { Preview } from '@storybook/react-vite'

import '../src/styles/fonts.scss'
import '../src/styles/index.css'
import './storybook.styles.css'

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ['Theme', 'Components'],
      },
    },
  },
}

export default preview
