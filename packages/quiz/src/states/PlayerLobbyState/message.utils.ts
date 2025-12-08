export const MESSAGES = [
  'Almost time! Warm up that brain — questions are on the way.',
  'Stay sharp — the quiz will begin when everyone is ready.',
  'Think you’ve got what it takes? The game starts soon.',
  'Get comfortable — your first question is approaching!',
  'Focus up! The round is about to begin.',
  'A little patience… the challenge starts shortly.',
  'Stretch your mind while you wait — the quiz is moments away.',
  'Deep breath — your challenge begins soon.',
  'Ready your reflexes! The countdown is about to start.',
  'Gather your thoughts — the quiz will kick off any moment now.',
]

export function getMessage() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
}

export function getNextMessage(currentMessage: string): string {
  const currentIndex = MESSAGES.indexOf(currentMessage)
  if (currentIndex === -1) {
    return getMessage()
  }
  const nextIndex = (currentIndex + 1) % MESSAGES.length
  return MESSAGES[nextIndex]
}

export function getRandomMessageExcluding(excludeMessage: string): string {
  const availableMessages = MESSAGES.filter((msg) => msg !== excludeMessage)
  return availableMessages[Math.floor(Math.random() * availableMessages.length)]
}
