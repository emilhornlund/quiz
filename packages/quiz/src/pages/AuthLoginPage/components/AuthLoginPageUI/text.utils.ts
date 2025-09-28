export const TITLES = [
  'Welcome back, Quizmaster!',
  'Hello again, genius!',
  'Your quiz hub awaits!',
  'Glad to see you again!',
  'Back to the quiz zone!',
]

export const MESSAGES = [
  'Sign in to access your quizzes, stats, and the brilliant chaos you left behind.',
  'Rejoin your quiz universe — your profile, history, and leaderboard spot are all waiting.',
  'Time to log in and reconnect with your inner trivia titan.',
  'Your quiz profile is safe and sound — just log in to pick up right where you left off.',
  'We kept your seat warm. Log in to dive back into your quiz world.',
  'Hop in to manage your quizzes, view your epic wins, or maybe just admire your high scores.',
  'Let’s get you logged in — the quizverse misses your brilliance.',
  'Back for more brainy fun? Let’s get those credentials in and pick up the thread.',
  'Access your personalized dashboard, question history, and the trivia trails you’ve blazed.',
]

const getRandomString = (strings: string[]) => {
  const randomIndex = Math.floor(Math.random() * strings.length)
  return strings[randomIndex]
}

export const getTitle = () => getRandomString(TITLES)

export const getMessage = () => getRandomString(MESSAGES)
