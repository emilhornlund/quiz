export interface EnvironmentVariables {
  SERVER_PORT: number
  REDIS_HOST: string
  REDIS_PORT: number
  REDIS_DB: number
  MONGODB_HOST: string
  MONGODB_PORT: number
  MONGODB_DB: string
  JWT_SECRET: string
  JWT_PRIVATE_KEY_PATH: string
  JWT_PUBLIC_KEY_PATH: string
}
