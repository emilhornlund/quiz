/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SERVER_PORT?: number
  readonly VITE_QUIZ_SERVICE_PROXY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
