import { LeaderboardTaskItem } from '../../../repositories/models/schemas'

import {
  buildLeaderboardFromGame,
  createLeaderboardHostEntry,
  createPodiumEntry,
} from './leaderboard.utils'

describe('leaderboard.utils', () => {
  const mockLeaderboardItem: LeaderboardTaskItem = {
    playerId: 'player1',
    position: 1,
    previousPosition: 3,
    nickname: 'TestPlayer',
    score: 100,
    streaks: 5,
  }

  const mockGame = {
    _id: 'game1',
    currentTask: {
      leaderboard: [
        mockLeaderboardItem,
        {
          playerId: 'player2',
          position: 2,
          previousPosition: 1,
          nickname: 'Player2',
          score: 80,
          streaks: 3,
        },
        {
          playerId: 'player3',
          position: 3,
          previousPosition: 2,
          nickname: 'Player3',
          score: 60,
          streaks: 2,
        },
        {
          playerId: 'player4',
          position: 4,
          previousPosition: 5,
          nickname: 'Player4',
          score: 40,
          streaks: 1,
        },
        {
          playerId: 'player5',
          position: 5,
          previousPosition: 4,
          nickname: 'Player5',
          score: 20,
          streaks: 0,
        },
        {
          playerId: 'player6',
          position: 6,
          previousPosition: 7,
          nickname: 'Player6',
          score: 10,
          streaks: 0,
        },
      ],
    },
  }

  describe('buildLeaderboardFromGame', () => {
    it('should return the first 5 players from the leaderboard', () => {
      const result = buildLeaderboardFromGame(mockGame as any)

      expect(result).toHaveLength(5)
      expect(result[0].playerId).toBe('player1')
      expect(result[4].playerId).toBe('player5')
    })

    it('should return all players if leaderboard has 5 or fewer players', () => {
      const gameWithFewPlayers = {
        ...mockGame,
        currentTask: {
          leaderboard: mockGame.currentTask.leaderboard.slice(0, 3),
        },
      }

      const result = buildLeaderboardFromGame(gameWithFewPlayers as any)

      expect(result).toHaveLength(3)
      expect(result).toEqual(gameWithFewPlayers.currentTask.leaderboard)
    })

    it('should return empty array if leaderboard is empty', () => {
      const gameWithEmptyLeaderboard = {
        ...mockGame,
        currentTask: {
          leaderboard: [] as LeaderboardTaskItem[],
        },
      }

      const result = buildLeaderboardFromGame(gameWithEmptyLeaderboard as any)

      expect(result).toHaveLength(0)
      expect(result).toEqual([])
    })

    it('should handle exactly 5 players', () => {
      const gameWithExactFive = {
        ...mockGame,
        currentTask: {
          leaderboard: mockGame.currentTask.leaderboard.slice(0, 5),
        },
      }

      const result = buildLeaderboardFromGame(gameWithExactFive as any)

      expect(result).toHaveLength(5)
      expect(result).toEqual(gameWithExactFive.currentTask.leaderboard)
    })

    it('should preserve the order of players from the original leaderboard', () => {
      const result = buildLeaderboardFromGame(mockGame as any)

      expect(result[0].position).toBe(1)
      expect(result[1].position).toBe(2)
      expect(result[2].position).toBe(3)
      expect(result[3].position).toBe(4)
      expect(result[4].position).toBe(5)
    })
  })

  describe('createLeaderboardHostEntry', () => {
    it('should return a formatted host entry with all required fields', () => {
      const result = createLeaderboardHostEntry(mockLeaderboardItem)

      expect(result).toEqual({
        position: 1,
        previousPosition: 3,
        nickname: 'TestPlayer',
        score: 100,
        streaks: 5,
      })
    })

    it('should handle item without previousPosition', () => {
      const itemWithoutPreviousPosition: LeaderboardTaskItem = {
        ...mockLeaderboardItem,
        previousPosition: undefined,
      }

      const result = createLeaderboardHostEntry(itemWithoutPreviousPosition)

      expect(result).toEqual({
        position: 1,
        previousPosition: undefined,
        nickname: 'TestPlayer',
        score: 100,
        streaks: 5,
      })
    })

    it('should handle zero values correctly', () => {
      const zeroItem: LeaderboardTaskItem = {
        playerId: 'player1',
        position: 0,
        previousPosition: 0,
        nickname: 'ZeroPlayer',
        score: 0,
        streaks: 0,
      }

      const result = createLeaderboardHostEntry(zeroItem)

      expect(result).toEqual({
        position: 0,
        previousPosition: 0,
        nickname: 'ZeroPlayer',
        score: 0,
        streaks: 0,
      })
    })

    it('should handle negative streaks', () => {
      const negativeStreakItem = {
        ...mockLeaderboardItem,
        streaks: -1,
      }

      const result = createLeaderboardHostEntry(negativeStreakItem)

      expect(result.streaks).toBe(-1)
    })
  })

  describe('createPodiumEntry', () => {
    it('should return a formatted podium entry with essential fields only', () => {
      const result = createPodiumEntry(mockLeaderboardItem)

      expect(result).toEqual({
        position: 1,
        nickname: 'TestPlayer',
        score: 100,
      })
    })

    it('should not include previousPosition in podium entry', () => {
      const result = createPodiumEntry(mockLeaderboardItem)

      expect(result).not.toHaveProperty('previousPosition')
    })

    it('should not include streaks in podium entry', () => {
      const result = createPodiumEntry(mockLeaderboardItem)

      expect(result).not.toHaveProperty('streaks')
    })

    it('should not include playerId in podium entry', () => {
      const result = createPodiumEntry(mockLeaderboardItem)

      expect(result).not.toHaveProperty('playerId')
    })

    it('should handle zero values correctly', () => {
      const zeroItem: LeaderboardTaskItem = {
        playerId: 'player1',
        position: 0,
        previousPosition: 0,
        nickname: 'ZeroPlayer',
        score: 0,
        streaks: 0,
      }

      const result = createPodiumEntry(zeroItem)

      expect(result).toEqual({
        position: 0,
        nickname: 'ZeroPlayer',
        score: 0,
      })
    })

    it('should handle high position numbers', () => {
      const highPositionItem = {
        ...mockLeaderboardItem,
        position: 999,
      }

      const result = createPodiumEntry(highPositionItem)

      expect(result.position).toBe(999)
    })

    it('should handle empty nickname', () => {
      const emptyNicknameItem = {
        ...mockLeaderboardItem,
        nickname: '',
      }

      const result = createPodiumEntry(emptyNicknameItem)

      expect(result.nickname).toBe('')
    })
  })

  describe('integration tests', () => {
    it('should work together to create host entries from a game leaderboard', () => {
      const leaderboard = buildLeaderboardFromGame(mockGame as any)
      const hostEntries = leaderboard.map(createLeaderboardHostEntry)

      expect(hostEntries).toHaveLength(5)
      expect(hostEntries[0]).toEqual({
        position: 1,
        previousPosition: 3,
        nickname: 'TestPlayer',
        score: 100,
        streaks: 5,
      })
    })

    it('should work together to create podium entries from a game leaderboard', () => {
      const leaderboard = buildLeaderboardFromGame(mockGame as any)
      const podiumEntries = leaderboard.map(createPodiumEntry)

      expect(podiumEntries).toHaveLength(5)
      expect(podiumEntries[0]).toEqual({
        position: 1,
        nickname: 'TestPlayer',
        score: 100,
      })
      expect(podiumEntries[0]).not.toHaveProperty('previousPosition')
      expect(podiumEntries[0]).not.toHaveProperty('streaks')
      expect(podiumEntries[0]).not.toHaveProperty('playerId')
    })
  })
})
