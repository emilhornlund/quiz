import * as Sentry from '@sentry/nestjs'

function getSentryEnvironment() {
  switch (process.env.KLURIGO_URL) {
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
    dsn: 'https://db8c9f306455a022069bdcc3f7f5cdc9@o4509486568374272.ingest.de.sentry.io/4509667099934800',
    release: process.env.SENTRY_RELEASE,
    environment: getSentryEnvironment(),
    sendDefaultPii: true,
    enableLogs: true,
    integrations: [],
    tracesSampleRate: 1.0,
  })
}
