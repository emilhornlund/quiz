export const TITLES = [
  'Join the quiz zone!',
  'Welcome, newcomer!',
  'Create your quiz identity',
  'Start your trivia journey',
  'Ready to play with the pros?',
  'Become a Quizmaster!',
  'Let’s get you set up!',
  'A brainy adventure awaits!',
  'Unlock your quiz future',
  'New here? Let’s fix that!',
]

export const MESSAGES = [
  'Create an account to start building quizzes, tracking your progress, and challenging others to brainy showdowns.',
  'Join a growing world of trivia lovers and unlock access to all the quizzes, stats, and features you never knew you needed.',
  'Sign up and claim your spot on the leaderboard — your quiz legacy starts here.',
  'Register now to craft quizzes, answer questions, and maybe even become a legend in the trivia universe.',
  'It all begins with a name, a password, and a spark of curiosity. Let’s get you signed up!',
  'Joining only takes a moment, but your quiz journey could last a lifetime (or at least until the next leaderboard reset).',
  'Create your account and dive headfirst into a world of questions, rankings, and brain-flexing fun.',
  'Signing up gives you access to personalized quiz history, stats, and the chance to shine in every round.',
  'Set up your profile, choose your nickname, and let the quiz games begin — well, almost.',
]

const getRandomString = (strings: string[]) => {
  const randomIndex = Math.floor(Math.random() * strings.length)
  return strings[randomIndex]
}

export const getTitle = () => getRandomString(TITLES)

export const getMessage = () => getRandomString(MESSAGES)
