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
}
