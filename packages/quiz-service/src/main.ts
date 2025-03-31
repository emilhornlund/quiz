import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app'
import { EnvironmentVariables } from './app/config'
import { configureApp } from './app/utils'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  configureApp(app)

  const config = new DocumentBuilder()
    .setTitle('Quiz Service')
    .setVersion('1.0.0')
    .addTag('auth', 'Operations for user authentication and authorization.')
    .addTag(
      'client',
      'Operations related to client registration and profile management.',
    )
    .addTag('game', 'Operations for creating and managing quiz games.')
    .addTag('media', 'Operations for uploading and retrieving media assets.')
    .addTag('quiz', 'Operations for creating and managing quiz content.')
    .addBearerAuth({ type: 'http', name: 'Authorization', in: 'header' })
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api_docs', app, document)

  const configService = app.get(ConfigService<EnvironmentVariables>)
  const port = configService.get('SERVER_PORT')
  await app.listen(port, '0.0.0.0')
}
bootstrap()
