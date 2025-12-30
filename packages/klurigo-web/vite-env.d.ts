/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string
  readonly VITE_KLURIGO_SERVICE_URL: string
  readonly VITE_KLURIGO_SERVICE_IMAGES_URL: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_GOOGLE_REDIRECT_URI: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_SENTRY_RELEASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
