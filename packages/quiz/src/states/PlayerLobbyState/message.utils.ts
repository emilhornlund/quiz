export const MESSAGES = [
  'Get ready, the questions are coming! Sharpen your mind.',
  'Hold tight! The challenge awaits. Are you ready to ace it?',
  'A few moments before the fun begins. Get your thinking cap on!',
]

export function getMessage() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
}
