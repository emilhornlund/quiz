const TITLES = [
  'Get Ready to Join the Fun!',
  'Enter the Game Arena!',
  'Your Journey Begins Here!',
  'Join the Challenge!',
]

const MESSAGES = [
  'Enter your nickname and get ready to compete for glory!',
  'Pick your name wisely, champion—your quest for the podium begins now!',
  'Step into the game! What’s your nickname for the leaderboard?',
  'Join the action! Let’s see what you’ve got!',
  'Time to shine! Enter your nickname and let the games begin!',
]

const getRandomString = (strings: string[]) => {
  const randomIndex = Math.floor(Math.random() * strings.length)
  return strings[randomIndex]
}

export const getTitle = () => getRandomString(TITLES)

export const getMessage = () => getRandomString(MESSAGES)
