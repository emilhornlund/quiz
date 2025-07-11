export interface EnvironmentVariables {
  ENVIRONMENT: string
  SERVER_PORT: number
  SERVER_ALLOW_ORIGIN: string
  REDIS_HOST: string
  REDIS_PORT: number
  REDIS_PASSWORD: string
  REDIS_DB: number
  MONGODB_HOST: string
  MONGODB_PORT: number
  MONGODB_USERNAME: string
  MONGODB_PASSWORD: string
  MONGODB_DB: string
  JWT_SECRET: string
  JWT_PRIVATE_KEY_PATH: string
  JWT_PUBLIC_KEY_PATH: string
  PEXELS_API_KEY: string
  UPLOAD_DIRECTORY: string
  EMAIL_ENABLED: boolean
  EMAIL_USERNAME: string
  EMAIL_PASSWORD: string
  KLURIGO_URL: string
}
