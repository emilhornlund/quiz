import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'
import { EnvironmentVariables } from './environment'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('/api')

  const config = new DocumentBuilder()
    .setTitle('Quiz Service')
    .setVersion('1.0.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api_docs', app, document)

  const configService = app.get(ConfigService<EnvironmentVariables>)
  const port = configService.get('SERVER_PORT')
  await app.listen(port)
}
bootstrap()
