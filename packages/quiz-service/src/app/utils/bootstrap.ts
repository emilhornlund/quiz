import { INestApplication } from '@nestjs/common'
import helmet from 'helmet'

export function configureApp(app: INestApplication) {
  app.enableShutdownHooks()
  app.setGlobalPrefix('/api', { exclude: ['/health'] })
  app.use(helmet())
}
