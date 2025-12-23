import { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-links', 'storybook-addon-remix-react-router'],
  core: {
    builder: '@storybook/builder-vite',
  },
  framework: '@storybook/react-vite',
}

export default config
