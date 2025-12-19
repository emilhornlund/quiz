import { spawn } from 'node:child_process'

export default async function globalSetup() {
  await run('yarn', ['workspace', '@quiz/quiz-service', 'e2e:setup'])
}

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} exited with code ${code}`))
      }
    })
  })
}
