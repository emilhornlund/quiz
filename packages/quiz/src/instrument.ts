import * as Sentry from '@sentry/react'

import config from './config'

function getSentryEnvironment() {
  switch (config.baseUrl) {
    case 'https://beta.klurigo.com':
      return 'beta'
    case 'https://klurigo.com':
      return 'prod'
    default:
      return 'dev'
  }
}

if (process.env.NODE_ENV === 'production') {
  console.log('Initializing Sentry')
  Sentry.init({
    dsn: config.VITE_SENTRY_DSN,
    release: config.VITE_SENTRY_RELEASE,
    environment: getSentryEnvironment(),
    tunnel: '/tunnel',
    sendDefaultPii: true,
    enableLogs: true,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
    tracePropagationTargets: [/^\/quiz-service\/api(\/|$)/],
  })
}
