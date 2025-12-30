import { resetE2eDb } from './e2e-db'

async function main() {
  await resetE2eDb({
    shouldWipeMongo: true,
    shouldWipeRedis: true,
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
