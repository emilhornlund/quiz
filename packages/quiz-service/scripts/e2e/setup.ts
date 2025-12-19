import { resetE2eDb } from './e2e-db'

async function main() {
  await resetE2eDb({
    shouldWipeMongo: true,
    shouldWipeRedis: true,
    seed: async ({ mongo }) => {
      await mongo.connection.db.collection<UserDoc>('users').insertOne({
        _id: '81b661d2-9b92-4011-b744-8ca7d14b71df',
        authProvider: 'LOCAL',
        defaultNickname: 'tester01',
        email: 'tester01@klurigo.com',
        hashedPassword:
          '$2a$10$.0oD9nYtp3OuDONp9Xfx7OP2cl1m22V1ALOpTlfRODbsHpHtQqUhu', //Super$ecretPassw0rd123#
        createdAt: new Date('2025-08-11T14:52:16.031Z'),
        updatedAt: new Date('2025-12-17T08:18:50.228Z'),
      })
    },
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

type UserDoc = {
  _id: string
  authProvider: 'LOCAL'
  defaultNickname: string
  email: string
  hashedPassword: string
  createdAt: Date
  updatedAt: Date
}
