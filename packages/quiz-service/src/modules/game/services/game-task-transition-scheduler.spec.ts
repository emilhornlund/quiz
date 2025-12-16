import { Job, Queue } from 'bullmq'

import { GameRepository } from '../../game-core/repositories'
import {
  GameDocument,
  TaskType,
} from '../../game-core/repositories/models/schemas'
import { GameEventPublisher } from '../../game-event/services'

import {
  GameTaskTransitionScheduler,
  TASK_QUEUE_NAME,
} from './game-task-transition-scheduler'
import { GameTaskTransitionService } from './game-task-transition.service'

describe('GameTaskTransitionScheduler', () => {
  const TASK_TRANSITION_JOB_NAME = TASK_QUEUE_NAME + 'transition'

  let scheduler: GameTaskTransitionScheduler

  let taskQueue: jest.Mocked<
    Pick<Queue<GameDocument, void, string>, 'getJob' | 'remove' | 'add'>
  >
  let gameRepository: jest.Mocked<
    Pick<GameRepository, 'findAndSaveWithLock' | 'findGameByIDOrThrow'>
  >
  let gameTaskTransitionService: jest.Mocked<
    Pick<
      GameTaskTransitionService,
      'getTaskTransitionCallback' | 'getTaskTransitionDelay'
    >
  >
  let gameEventPublisher: jest.Mocked<Pick<GameEventPublisher, 'publish'>>

  const logger = {
    log: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }

  const buildGameDocument = (
    overrides?: Partial<GameDocument>,
    taskOverrides?: Partial<GameDocument['currentTask']>,
  ): GameDocument => {
    const base: GameDocument = {
      _id: 'game-1',
      currentTask: {
        _id: 'task-1',
        type: 'Lobby' as unknown as TaskType,
        status: 'pending',
        currentTransitionInitiated: undefined,
        currentTransitionExpires: undefined,
      },
    } as unknown as GameDocument

    return {
      ...base,
      ...overrides,
      currentTask: {
        ...base.currentTask,
        ...taskOverrides,
      },
    } as GameDocument
  }

  beforeEach(() => {
    taskQueue = {
      getJob: jest.fn(),
      remove: jest.fn(),
      add: jest.fn(),
    }

    gameRepository = {
      findAndSaveWithLock: jest.fn(),
      findGameByIDOrThrow: jest.fn(),
    }

    gameTaskTransitionService = {
      getTaskTransitionCallback: jest.fn(),
      getTaskTransitionDelay: jest.fn(),
    }

    gameEventPublisher = {
      publish: jest.fn(),
    }

    scheduler = new GameTaskTransitionScheduler(
      taskQueue as unknown as Queue<GameDocument, void, string>,
      gameRepository as unknown as GameRepository,
      gameTaskTransitionService as unknown as GameTaskTransitionService,
      gameEventPublisher as unknown as GameEventPublisher,
    )
    ;(scheduler as any).logger = logger

    jest.clearAllMocks()
  })

  describe('scheduleTaskTransition', () => {
    it('deletes existing transition job and performs immediate transition when current status is active', async () => {
      const game = buildGameDocument(undefined, { status: 'active' })
      const callback = jest.fn().mockResolvedValue(undefined)

      gameTaskTransitionService.getTaskTransitionCallback.mockReturnValue(
        callback,
      )

      taskQueue.getJob.mockResolvedValue({ id: 'job-1' } as any)

      const performTransitionSpy = jest
        .spyOn(scheduler as any, 'performTransition')
        .mockResolvedValue(undefined)

      await scheduler.scheduleTaskTransition(game)

      expect(taskQueue.getJob).toHaveBeenCalledTimes(1)
      expect(taskQueue.remove).toHaveBeenCalledTimes(1)
      expect(performTransitionSpy).toHaveBeenCalledTimes(1)
      expect(performTransitionSpy).toHaveBeenCalledWith(
        game,
        'completed',
        callback,
      )
      expect(gameRepository.findAndSaveWithLock).not.toHaveBeenCalled()
      expect(gameEventPublisher.publish).not.toHaveBeenCalled()
    })

    it('skips scheduling when an existing transition job exists and status is not active', async () => {
      const game = buildGameDocument(undefined, { status: 'pending' })

      gameTaskTransitionService.getTaskTransitionCallback.mockReturnValue(
        jest.fn().mockResolvedValue(undefined),
      )

      taskQueue.getJob.mockResolvedValue({ id: 'job-1' } as any)

      const performTransitionSpy = jest
        .spyOn(scheduler as any, 'performTransition')
        .mockResolvedValue(undefined)
      const scheduleDeferredSpy = jest
        .spyOn(scheduler as any, 'scheduleDeferredTransition')
        .mockResolvedValue(undefined)

      await scheduler.scheduleTaskTransition(game)

      expect(taskQueue.remove).not.toHaveBeenCalled()
      expect(performTransitionSpy).not.toHaveBeenCalled()
      expect(scheduleDeferredSpy).not.toHaveBeenCalled()
      expect(gameRepository.findAndSaveWithLock).not.toHaveBeenCalled()
      expect(gameEventPublisher.publish).not.toHaveBeenCalled()
      expect(logger.warn).toHaveBeenCalledTimes(1)
    })

    it('persists transition timestamps, publishes, and schedules a deferred transition when delay > 0 and no existing job', async () => {
      const game = buildGameDocument(undefined, { status: 'pending' })
      const callback = jest.fn().mockResolvedValue(undefined)

      gameTaskTransitionService.getTaskTransitionCallback.mockReturnValue(
        callback,
      )
      gameTaskTransitionService.getTaskTransitionDelay.mockReturnValue(5_000)

      taskQueue.getJob.mockResolvedValue(null)

      gameRepository.findAndSaveWithLock.mockImplementation(
        async (_id, mutator) => {
          const doc = buildGameDocument(
            { _id: game._id },
            { ...game.currentTask },
          )
          const mutated = await mutator(doc as any)
          return mutated as any
        },
      )

      const scheduleDeferredSpy = jest
        .spyOn(scheduler as any, 'scheduleDeferredTransition')
        .mockResolvedValue(undefined)
      const performTransitionSpy = jest
        .spyOn(scheduler as any, 'performTransition')
        .mockResolvedValue(undefined)

      await scheduler.scheduleTaskTransition(game)

      expect(gameRepository.findAndSaveWithLock).toHaveBeenCalledTimes(1)
      expect(gameEventPublisher.publish).toHaveBeenCalledTimes(1)

      const publishedDoc = gameEventPublisher.publish.mock.calls[0][0] as any
      expect(
        publishedDoc.currentTask.currentTransitionInitiated,
      ).toBeInstanceOf(Date)
      expect(publishedDoc.currentTask.currentTransitionExpires).toBeInstanceOf(
        Date,
      )
      expect(
        (publishedDoc.currentTask.currentTransitionExpires as Date).getTime(),
      ).toBeGreaterThan(
        (publishedDoc.currentTask.currentTransitionInitiated as Date).getTime(),
      )

      expect(scheduleDeferredSpy).toHaveBeenCalledTimes(1)
      expect(scheduleDeferredSpy).toHaveBeenCalledWith(game, 5_000, 'active')

      expect(performTransitionSpy).not.toHaveBeenCalled()
    })

    it('persists transition timestamps, publishes, and performs immediate transition when delay <= 0 and no existing job', async () => {
      const game = buildGameDocument(undefined, { status: 'pending' })
      const callback = jest.fn().mockResolvedValue(undefined)

      gameTaskTransitionService.getTaskTransitionCallback.mockReturnValue(
        callback,
      )
      gameTaskTransitionService.getTaskTransitionDelay.mockReturnValue(0)

      taskQueue.getJob.mockResolvedValue(null)

      gameRepository.findAndSaveWithLock.mockImplementation(
        async (_id, mutator) => {
          const doc = buildGameDocument(
            { _id: game._id },
            { ...game.currentTask },
          )
          const mutated = await mutator(doc as any)
          return mutated as any
        },
      )

      const scheduleDeferredSpy = jest
        .spyOn(scheduler as any, 'scheduleDeferredTransition')
        .mockResolvedValue(undefined)
      const performTransitionSpy = jest
        .spyOn(scheduler as any, 'performTransition')
        .mockResolvedValue(undefined)

      await scheduler.scheduleTaskTransition(game)

      expect(gameRepository.findAndSaveWithLock).toHaveBeenCalledTimes(1)
      expect(gameEventPublisher.publish).toHaveBeenCalledTimes(1)

      const publishedDoc = gameEventPublisher.publish.mock.calls[0][0] as any
      expect(
        publishedDoc.currentTask.currentTransitionInitiated,
      ).toBeInstanceOf(Date)
      expect(publishedDoc.currentTask.currentTransitionExpires).toBeUndefined()

      expect(scheduleDeferredSpy).not.toHaveBeenCalled()
      expect(performTransitionSpy).toHaveBeenCalledTimes(1)
      expect(performTransitionSpy).toHaveBeenCalledWith(
        game,
        'active',
        callback,
      )
    })
  })

  describe('scheduleDeferredTransition', () => {
    it('adds a delayed job with correct jobId, delay, and priority', async () => {
      const game = buildGameDocument(undefined, { status: 'pending' })
      const delay = 2_000

      await (scheduler as any).scheduleDeferredTransition(game, delay, 'active')

      expect(taskQueue.add).toHaveBeenCalledTimes(1)

      const [name, payload, opts] = taskQueue.add.mock.calls[0]
      expect(name).toBe(TASK_TRANSITION_JOB_NAME)
      expect(payload).toBe(game)
      expect(opts).toMatchObject({
        delay,
        priority: 1,
      })
      expect((opts as any).jobId).toContain('transition-')
    })

    it('logs and swallows errors when queue.add fails', async () => {
      const game = buildGameDocument(undefined, { status: 'pending' })
      taskQueue.add.mockRejectedValue(new Error('boom'))

      await (scheduler as any).scheduleDeferredTransition(game, 1_000, 'active')

      expect(logger.error).toHaveBeenCalledTimes(1)
    })
  })

  describe('performTransition', () => {
    it('updates status (when nextStatus provided), executes callback, publishes, and performs post-transition', async () => {
      const game = buildGameDocument(undefined, { status: 'pending' })
      const callback = jest.fn(async (doc: any) => {
        doc.someSideEffect = true
      })

      gameRepository.findAndSaveWithLock.mockImplementation(
        async (_id, mutator) => {
          const doc = buildGameDocument(
            { _id: game._id },
            { ...game.currentTask },
          )
          const mutated = await mutator(doc as any)
          mutated.currentTask.status = 'active'
          return mutated as any
        },
      )

      const postSpy = jest
        .spyOn(scheduler as any, 'performPostTransition')
        .mockResolvedValue(undefined)

      await (scheduler as any).performTransition(game, 'active', callback)

      expect(gameRepository.findAndSaveWithLock).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledTimes(1)
      expect(gameEventPublisher.publish).toHaveBeenCalledTimes(1)

      expect(postSpy).toHaveBeenCalledTimes(1)
      expect(postSpy).toHaveBeenCalledWith(
        expect.objectContaining({ _id: game._id }),
      )
    })

    it('does not run post-transition when updated status does not match expected nextStatus', async () => {
      const game = buildGameDocument(undefined, { status: 'pending' })

      gameRepository.findAndSaveWithLock.mockImplementation(
        async (_id, mutator) => {
          const doc = buildGameDocument(
            { _id: game._id },
            { ...game.currentTask },
          )
          const mutated = await mutator(doc as any)
          mutated.currentTask.status = 'completed'
          return mutated as any
        },
      )

      const postSpy = jest
        .spyOn(scheduler as any, 'performPostTransition')
        .mockResolvedValue(undefined)

      await (scheduler as any).performTransition(game, 'active')

      expect(gameEventPublisher.publish).toHaveBeenCalledTimes(1)
      expect(postSpy).not.toHaveBeenCalled()
      expect(logger.warn).toHaveBeenCalledTimes(1)
    })

    it('does not run post-transition when updated task type is Quit', async () => {
      const game = buildGameDocument(undefined, { status: 'active' })

      gameRepository.findAndSaveWithLock.mockImplementation(
        async (_id, mutator) => {
          const doc = buildGameDocument(
            { _id: game._id },
            { ...game.currentTask },
          )
          const mutated = await mutator(doc as any)
          mutated.currentTask.type = TaskType.Quit
          mutated.currentTask.status = 'completed'
          return mutated as any
        },
      )

      const postSpy = jest
        .spyOn(scheduler as any, 'performPostTransition')
        .mockResolvedValue(undefined)

      await (scheduler as any).performTransition(game, 'completed')

      expect(gameEventPublisher.publish).toHaveBeenCalledTimes(1)
      expect(postSpy).not.toHaveBeenCalled()
      expect(logger.warn).toHaveBeenCalledTimes(1)
    })

    it('logs errors and does not throw when repository update fails', async () => {
      const game = buildGameDocument(undefined, { status: 'pending' })

      gameRepository.findAndSaveWithLock.mockRejectedValue(new Error('db-fail'))

      await expect(
        (scheduler as any).performTransition(game, 'active'),
      ).resolves.toBeUndefined()

      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(gameEventPublisher.publish).not.toHaveBeenCalled()
    })
  })

  describe('performPostTransition', () => {
    it('schedules next transition when status is pending (regardless of delay)', async () => {
      const game = buildGameDocument(undefined, { status: 'pending' })

      gameTaskTransitionService.getTaskTransitionDelay.mockReturnValue(10_000)

      const scheduleSpy = jest
        .spyOn(scheduler, 'scheduleTaskTransition')
        .mockResolvedValue(undefined)

      await (scheduler as any).performPostTransition(game)

      expect(scheduleSpy).toHaveBeenCalledTimes(1)
      expect(scheduleSpy).toHaveBeenCalledWith(game)
    })

    it('schedules next transition when status is active and delay > 0', async () => {
      const game = buildGameDocument(undefined, { status: 'active' })

      gameTaskTransitionService.getTaskTransitionDelay.mockReturnValue(1_000)

      const scheduleSpy = jest
        .spyOn(scheduler, 'scheduleTaskTransition')
        .mockResolvedValue(undefined)

      await (scheduler as any).performPostTransition(game)

      expect(scheduleSpy).toHaveBeenCalledTimes(1)
    })

    it('does not schedule next transition when status is active and delay <= 0', async () => {
      const game = buildGameDocument(undefined, { status: 'active' })

      gameTaskTransitionService.getTaskTransitionDelay.mockReturnValue(0)

      const scheduleSpy = jest
        .spyOn(scheduler, 'scheduleTaskTransition')
        .mockResolvedValue(undefined)

      await (scheduler as any).performPostTransition(game)

      expect(scheduleSpy).not.toHaveBeenCalled()
    })

    it('rethrows after logging when scheduling next transition fails', async () => {
      const game = buildGameDocument(undefined, { status: 'pending' })

      gameTaskTransitionService.getTaskTransitionDelay.mockReturnValue(10_000)

      jest
        .spyOn(scheduler, 'scheduleTaskTransition')
        .mockRejectedValue(new Error('schedule-fail'))

      await expect(
        (scheduler as any).performPostTransition(game),
      ).rejects.toThrow('schedule-fail')
      expect(logger.error).toHaveBeenCalledTimes(1)
    })
  })

  describe('process', () => {
    it('executes deferred transition when latest game task type/status match and removes the job first', async () => {
      const game = buildGameDocument(undefined, { status: 'pending' })
      const callback = jest.fn().mockResolvedValue(undefined)

      const job: Job<GameDocument, void, string> = {
        id: 'transition-job-1',
        name: TASK_TRANSITION_JOB_NAME,
        data: game,
      } as any

      gameTaskTransitionService.getTaskTransitionCallback.mockReturnValue(
        callback,
      )

      gameRepository.findGameByIDOrThrow.mockResolvedValue(
        buildGameDocument(
          { _id: game._id },
          { type: game.currentTask.type, status: 'pending' },
        ),
      )

      taskQueue.getJob.mockResolvedValue({ id: job.id } as any)

      const performSpy = jest
        .spyOn(scheduler as any, 'performTransition')
        .mockResolvedValue(undefined)

      await expect(scheduler.process(job)).rejects.toThrow(
        'Method not implemented.',
      )

      expect(gameRepository.findGameByIDOrThrow).toHaveBeenCalledTimes(1)
      expect(taskQueue.remove).toHaveBeenCalledTimes(1)
      expect(taskQueue.remove).toHaveBeenCalledWith(job.id)

      expect(performSpy).toHaveBeenCalledTimes(1)
      expect(performSpy).toHaveBeenCalledWith(game, 'active', callback)
    })

    it('skips deferred transition when latest game task type/status do not match', async () => {
      const game = buildGameDocument(undefined, { status: 'pending' })

      const job: Job<GameDocument, void, string> = {
        id: 'transition-job-1',
        name: TASK_TRANSITION_JOB_NAME,
        data: game,
      } as any

      gameTaskTransitionService.getTaskTransitionCallback.mockReturnValue(
        jest.fn().mockResolvedValue(undefined),
      )

      gameRepository.findGameByIDOrThrow.mockResolvedValue(
        buildGameDocument(
          { _id: game._id },
          { type: 'Other' as any as TaskType, status: 'active' },
        ),
      )

      const performSpy = jest
        .spyOn(scheduler as any, 'performTransition')
        .mockResolvedValue(undefined)

      await expect(scheduler.process(job)).rejects.toThrow(
        'Method not implemented.',
      )

      expect(performSpy).not.toHaveBeenCalled()
      expect(taskQueue.remove).not.toHaveBeenCalled()
      expect(logger.warn).toHaveBeenCalledTimes(1)
    })

    it('removes job (if exists) and logs error when handler throws', async () => {
      const game = buildGameDocument(undefined, { status: 'pending' })

      const job: Job<GameDocument, void, string> = {
        id: 'transition-job-1',
        name: TASK_TRANSITION_JOB_NAME,
        data: game,
      } as any

      gameTaskTransitionService.getTaskTransitionCallback.mockImplementation(
        () => {
          throw new Error('callback-fail')
        },
      )

      taskQueue.getJob.mockResolvedValue({ id: job.id } as any)

      await expect(scheduler.process(job)).rejects.toThrow(
        'Method not implemented.',
      )

      expect(taskQueue.remove).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledTimes(1)
    })

    it('throws "Method not implemented." even for unrelated job names', async () => {
      const game = buildGameDocument()

      const job: Job<GameDocument, void, string> = {
        id: 'something-else',
        name: 'other',
        data: game,
      } as any

      await expect(scheduler.process(job)).rejects.toThrow(
        'Method not implemented.',
      )

      expect(gameRepository.findGameByIDOrThrow).not.toHaveBeenCalled()
      expect(taskQueue.remove).not.toHaveBeenCalled()
    })
  })
})
