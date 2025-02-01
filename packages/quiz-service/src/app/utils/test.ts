import { INestApplication } from '@nestjs/common'
import { getConnectionToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Connection } from 'mongoose'

import { AppModule } from '../app.module'

import { configureApp } from './bootstrap'

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleFixture.createNestApplication()
  configureApp(app)
  await app.init()

  return app
}

export async function closeTestApp(app: INestApplication): Promise<void> {
  await (app.get(getConnectionToken()) as Connection).db.dropDatabase()
  await app.close()
}
