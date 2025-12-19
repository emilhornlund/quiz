import { Redis } from 'ioredis'
import mongoose from 'mongoose'

type ResetOptions = {
  shouldWipeMongo: boolean
  shouldWipeRedis: boolean
  seed?: (ctx: { mongo: typeof mongoose; redis: Redis }) => Promise<void>
}

function getMongoUri(): string {
  return (
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/klurigo_service_test'
  )
}

function assertSafeMongoUri(mongoUri: string): void {
  const dbName = mongoUri.split('/').pop()?.split('?')[0]
  if (!dbName || !dbName.includes('_test')) {
    throw new Error(
      `Refusing to wipe MongoDB database "${dbName}". Set MONGODB_URI to a test database (e.g. .../klurigo_service_test).`,
    )
  }
}

function getRedisUrl(): string {
  const redisDb = process.env.REDIS_DB ?? '1'
  const base = process.env.REDIS_URL ?? 'redis://localhost:6379'
  return `${base}/${redisDb}`
}

export async function resetE2eDb(options: ResetOptions): Promise<void> {
  const mongoUri = getMongoUri()
  assertSafeMongoUri(mongoUri)

  const redis = new Redis(getRedisUrl())

  try {
    await mongoose.connect(mongoUri)

    if (options.shouldWipeMongo) {
      const collections = await mongoose.connection.db.collections()
      await Promise.all(collections.map((c) => c.deleteMany({})))
    }

    if (options.shouldWipeRedis) {
      await redis.flushdb()
    }

    if (options.seed) {
      await options.seed({ mongo: mongoose, redis })
    }
  } finally {
    await mongoose.disconnect().catch(() => undefined)
    await redis.quit().catch(() => undefined)
  }
}
