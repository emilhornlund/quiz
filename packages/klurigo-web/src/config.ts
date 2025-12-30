export default {
  /**
   * The base URL of the application (e.g., https://klurigo.com).
   * Used for building absolute links and redirects.
   */
  baseUrl: import.meta.env.VITE_BASE_URL as string,

  /**
   * The base URL for the Quiz Service backend API.
   * All API requests are prefixed with this path.
   */
  klurigoServiceUrl: import.meta.env.VITE_KLURIGO_SERVICE_URL as string,

  /**
   * The base URL for accessing uploaded images hosted by the Quiz Service backend.
   * Used to load quiz-related media assets.
   */
  klurigoServiceImagesUrl: import.meta.env
    .VITE_KLURIGO_SERVICE_IMAGES_URL as string,

  /**
   * Google OAuth client ID used to initiate the PKCE authorization flow.
   */
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,

  /**
   * Redirect URI registered in the Google Cloud Console.
   * Determines where users are redirected after a successful OAuth login.
   */
  googleRedirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI as string,

  /**
   * Sentry Data Source Name (DSN) for error tracking and performance monitoring.
   */
  sentryDSN: import.meta.env.VITE_SENTRY_DSN as string,

  /**
   * Release identifier for Sentry, injected at build time to link errors
   * and performance data to the correct application version.
   */
  sentryRelease: import.meta.env.VITE_SENTRY_RELEASE as string,
}
