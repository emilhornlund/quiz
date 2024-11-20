import { INestApplication } from '@nestjs/common'
import helmet from 'helmet'

export function configureApp(app: INestApplication) {
  app.enableShutdownHooks()
  app.setGlobalPrefix('/api')
  app.use(helmet())
}
