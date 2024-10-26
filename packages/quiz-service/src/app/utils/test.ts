import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'

import { AppModule } from '../app.module'

import { configureApp } from './bootstrap'

let mongod: MongoMemoryServer

export async function initializeMongoMemoryServer(): Promise<MongoMemoryServer> {
  if (!mongod) {
    mongod = await MongoMemoryServer.create({
      instance: { port: parseInt(process.env.MONGODB_PORT, 10) },
      binary: {
        downloadDir: 'node_modules/.cache/mongodb-memory-server',
      },
    })
  }
  return mongod
}

export async function createTestApp(): Promise<INestApplication> {
  await initializeMongoMemoryServer()

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

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
