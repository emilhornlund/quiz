export const POSITION_MESSAGES = {
  1: {
    correct: [
      "You're on the podium! First place, and you nailed it!",
      'Champion! Top spot and a perfect answer!',
      "You're number one with the correct answer! Impressive!",
    ],
    incorrect: [
      "You're on the podium! First place, but you missed this one!",
      "Champion, but a wrong answer! You'll bounce back!",
      "Top spot, but this answer wasn't correct!",
    ],
  },
  2: {
    correct: [
      "You're on the podium! So close, second place with a correct answer!",
      'Runner-up with a perfect answer! Amazing job!',
      'Second place and you answered correctly!',
    ],
    incorrect: [
      "You're on the podium! Second place, but a wrong answer!",
      'Runner-up, but you missed this one!',
      'Second place, but the answer wasn’t right.',
    ],
  },
  3: {
    correct: [
      "You're on the podium! Third place and a correct answer!",
      'A bronze finish with the right answer! Well done!',
      'Third place with a correct answer! Keep it up!',
    ],
    incorrect: [
      "You're on the podium! Third place, but you missed it!",
      'A bronze finish, but wrong answer this time!',
      'Third place, but the answer was incorrect.',
    ],
  },
  defaultTop10: {
    correct: [
      'Great effort! Top 10 and you answered correctly!',
      'Top 10 finish with a correct answer! Keep pushing!',
      'You’re in the top 10 and nailed the answer!',
    ],
    incorrect: [
      'Top 10 finish, but you missed the answer!',
      "You're in the top 10, but the answer wasn’t right!",
      "Great effort, but this answer wasn't correct.",
    ],
  },
  defaultTop20: {
    correct: [
      'Good job! Top 20 and you got it right!',
      "Top 20 finish and a correct answer! You're doing great!",
      'Solid performance, and you answered correctly!',
    ],
    incorrect: [
      'Top 20 finish, but the answer wasn’t correct!',
      'Good job, but this one was wrong!',
      'Solid performance, but you missed the answer.',
    ],
  },
  defaultBelow20: {
    correct: [
      'Every game is a learning experience! You got it right this time!',
      'Keep pushing! You got the correct answer!',
      'Great effort! And you answered correctly!',
    ],
    incorrect: [
      'Every game is a learning experience! Keep trying!',
      "Keep playing, and don't worry about this one!",
      "Great effort! You'll get it right next time!",
    ],
  },
}

const getRandomMessage = (messages: string[]) => {
  const randomIndex = Math.floor(Math.random() * messages.length)
  return messages[randomIndex]
}

export const getPositionMessage = (
  position: number,
  answeredCorrectly: boolean,
) => {
  const answerType = answeredCorrectly ? 'correct' : 'incorrect'

  if (position === 1) {
    return getRandomMessage(POSITION_MESSAGES[1][answerType])
  } else if (position === 2) {
    return getRandomMessage(POSITION_MESSAGES[2][answerType])
  } else if (position === 3) {
    return getRandomMessage(POSITION_MESSAGES[3][answerType])
  } else if (position > 3 && position <= 10) {
    return getRandomMessage(POSITION_MESSAGES.defaultTop10[answerType])
  } else if (position > 10 && position <= 20) {
    return getRandomMessage(POSITION_MESSAGES.defaultTop20[answerType])
  } else {
    return getRandomMessage(POSITION_MESSAGES.defaultBelow20[answerType])
  }
}
