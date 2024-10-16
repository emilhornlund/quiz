import { INestApplication } from '@nestjs/common'

export function configureApp(app: INestApplication) {
  app.enableShutdownHooks()
  app.setGlobalPrefix('/api')
}
