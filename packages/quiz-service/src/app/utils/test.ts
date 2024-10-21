import { INestApplication } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'

import { AppModule } from '../app.module'

import { configureApp } from './bootstrap'

let mongod: MongoMemoryServer

export async function initializeMongoMemoryServer(): Promise<MongoMemoryServer> {
  if (!mongod) {
    mongod = await MongoMemoryServer.create({
      binary: {
        version: '4.2.8',
        downloadDir: 'node_modules/.cache/mongodb-memory-server',
      },
    })
  }
  return mongod
}

export async function createTestApp(): Promise<INestApplication> {
  const mongod = await initializeMongoMemoryServer()

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideModule(MongooseModule)
    .useModule(
      MongooseModule.forRootAsync({
        useFactory: async () => ({
          uri: mongod.getUri(),
        }),
      }),
    )
    .compile()

  const app = moduleFixture.createNestApplication()
  configureApp(app)
  await app.init()

  return app
}

export async function stopMongoMemoryServer(): Promise<void> {
  if (mongod) {
    await mongod.stop()
  }
}
