export default {
  baseUrl: import.meta.env.VITE_BASE_URL as string,
  quizServiceUrl: import.meta.env.VITE_QUIZ_SERVICE_URL as string,
  quizServiceImagesUrl: import.meta.env.VITE_QUIZ_SERVICE_IMAGES_URL as string,

  /**
   * Google OAuth client ID for initiating the PKCE flow.
   */
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,

  /**
   * Redirect URI registered in Google Console for OAuth callbacks.
   */
  googleRedirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI as string,

  /**
   * The Sentry Data Source Name (DSN) for the application.
   */
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN as string,

  /**
   * The release identifier injected at build time and passed to Sentry.
   */
  VITE_SENTRY_RELEASE: import.meta.env.VITE_SENTRY_RELEASE as string,
}
