export const POSITION_MESSAGES = {
  1: [
    'You did it! First place and ultimate champion!',
    'What a performance! You claimed the top spot!',
    'Victory is yours! First place, congratulations!',
    'Unstoppable! You dominated and won first place!',
  ],
  2: [
    'So close! Second place and an outstanding effort!',
    'An amazing run! You’re the runner-up!',
    'Second place and still a winner!',
    'Just shy of victory, but a stellar performance!',
  ],
  3: [
    'You made it to the podium! A fantastic third place!',
    'Bronze finish! You fought your way onto the podium!',
    'Third place on the podium, great work!',
    'What a finish! You earned your spot in third place!',
  ],
  defaultTop10: [
    'You’re in the top 10! A great achievement!',
    'You finished strong in the top 10! Keep up the great work!',
    'Top 10 finish, fantastic effort all the way!',
    'What a game! You’re in the top 10, keep pushing for more!',
  ],
  defaultTop20: [
    'You finished in the top 20! A solid performance!',
    'Great job! You’re in the top 20, keep improving!',
    "Top 20 finish, you're doing great!",
    'You’re almost there! Top 20 finish, well done!',
  ],
  defaultBelow20: [
    'Great effort! Keep playing, the next game is yours!',
    'Keep your head up! You’ve got what it takes!',
    "Every game is progress! You'll climb the rankings next time!",
    'Good game! Keep improving and aim higher in the next one!',
  ],
}

const getRandomMessage = (messages: string[]) => {
  const randomIndex = Math.floor(Math.random() * messages.length)
  return messages[randomIndex]
}

export const getPodiumPositionMessage = (position: number) => {
  if (position === 1) {
    return getRandomMessage(POSITION_MESSAGES[1])
  } else if (position === 2) {
    return getRandomMessage(POSITION_MESSAGES[2])
  } else if (position === 3) {
    return getRandomMessage(POSITION_MESSAGES[3])
  } else if (position > 3 && position <= 10) {
    return getRandomMessage(POSITION_MESSAGES.defaultTop10)
  } else if (position > 10 && position <= 20) {
    return getRandomMessage(POSITION_MESSAGES.defaultTop20)
  } else {
    return getRandomMessage(POSITION_MESSAGES.defaultBelow20)
  }
}
