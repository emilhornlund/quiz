import { Logger } from '@nestjs/common'
import {
  Document,
  HydratedDocument,
  Model,
  Query,
  UpdateWriteOpResult,
} from 'mongoose'
import { FilterQuery, UpdateQuery } from 'mongoose'

import { BaseRepository } from './base.repository'

interface TestDocument extends Document {
  _id: string
  name: string
  age?: number
  createdAt: Date
}

class TestRepository extends BaseRepository<TestDocument> {
  constructor(model: Model<TestDocument>) {
    super(model, 'Test')
  }
}

describe('BaseRepository', () => {
  let repository: TestRepository
  let mockModel: jest.Mocked<Model<TestDocument>>
  let mockLoggerDebug: jest.SpyInstance
  let mockLoggerLog: jest.SpyInstance
  let mockLoggerWarn: jest.SpyInstance
  let mockLoggerError: jest.SpyInstance

  beforeEach(() => {
    mockModel = {
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      exists: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      updateMany: jest.fn(),
      findByIdAndDelete: jest.fn(),
      deleteMany: jest.fn(),
    } as unknown as unknown as jest.Mocked<Model<TestDocument>>

    repository = new TestRepository(mockModel)

    mockLoggerDebug = jest
      .spyOn(Logger.prototype, 'debug')
      .mockImplementation(() => {})
    mockLoggerLog = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => {})
    mockLoggerWarn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => {})
    mockLoggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findById', () => {
    it('should return the document if found', async () => {
      const mockDoc = {
        _id: '1',
        name: 'test',
        createdAt: new Date(),
        age: 10,
      } as HydratedDocument<TestDocument>
      mockModel.findById.mockResolvedValue(mockDoc)

      const result = await repository.findById('1')

      expect(result).toEqual(mockDoc)
      expect(mockModel.findById).toHaveBeenCalledWith('1')
      expect(mockLoggerDebug).not.toHaveBeenCalled()
    })

    it('should return null if not found and log debug', async () => {
      mockModel.findById.mockResolvedValue(null)

      const result = await repository.findById('1')

      expect(result).toBeNull()
      expect(mockModel.findById).toHaveBeenCalledWith('1')
      expect(mockLoggerDebug).toHaveBeenCalledWith(
        `Document with id '1' not found`,
      )
    })

    it('should throw error and log if exception occurs', async () => {
      const error = new Error('findById error')
      mockModel.findById.mockRejectedValue(error)

      await expect(repository.findById('1')).rejects.toThrow(error)
      expect(mockLoggerError).toHaveBeenCalledWith(
        `Error finding document by id '1':`,
        error,
      )
    })
  })

  describe('findOne', () => {
    it('should return the document if found', async () => {
      const filter: FilterQuery<TestDocument> = { name: 'test' }
      const mockDoc = {
        _id: '1',
        name: 'test',
        createdAt: new Date(),
        age: 10,
      } as HydratedDocument<TestDocument>
      mockModel.findOne.mockResolvedValue(mockDoc)

      const result = await repository.findOne(filter)

      expect(result).toEqual(mockDoc)
      expect(mockModel.findOne).toHaveBeenCalledWith(filter)
      expect(mockLoggerDebug).not.toHaveBeenCalled()
    })

    it('should return null if not found and log debug', async () => {
      const filter: FilterQuery<TestDocument> = { name: 'test' }
      mockModel.findOne.mockResolvedValue(null)

      const result = await repository.findOne(filter)

      expect(result).toBeNull()
      expect(mockModel.findOne).toHaveBeenCalledWith(filter)
      expect(mockLoggerDebug).toHaveBeenCalledWith(
        'No document found matching filter:',
        filter,
      )
    })

    it('should throw error and log if exception occurs', async () => {
      const filter: FilterQuery<TestDocument> = { name: 'test' }
      const error = new Error('findOne error')
      mockModel.findOne.mockRejectedValue(error)

      await expect(repository.findOne(filter)).rejects.toThrow(error)
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Error finding document with filter:',
        error,
      )
    })
  })

  describe('find', () => {
    it('should return an array of documents', async () => {
      const filter: FilterQuery<TestDocument> = { age: { $gt: 5 } }
      const mockDocs = [
        { _id: '1', name: 'test1', createdAt: new Date(), age: 10 },
        { _id: '2', name: 'test2', createdAt: new Date(), age: 15 },
      ] as HydratedDocument<TestDocument>[]
      mockModel.find.mockResolvedValue(mockDocs)

      const result = await repository.find(filter)

      expect(result).toEqual(mockDocs)
      expect(mockModel.find).toHaveBeenCalledWith(filter)
    })

    it('should return empty array if no documents found', async () => {
      mockModel.find.mockResolvedValue([])

      const result = await repository.find()

      expect(result).toEqual([])
      expect(mockModel.find).toHaveBeenCalledWith({})
    })

    it('should throw error and log if exception occurs', async () => {
      const filter: FilterQuery<TestDocument> = { age: { $gt: 5 } }
      const error = new Error('find error')
      mockModel.find.mockRejectedValue(error)

      await expect(repository.find(filter)).rejects.toThrow(error)
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Error finding documents with filter:',
        error,
      )
    })
  })

  describe('findWithPagination', () => {
    let mockQuery: jest.Mocked<
      Query<HydratedDocument<TestDocument>[], HydratedDocument<TestDocument>>
    >

    beforeEach(() => {
      mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn(),
      } as unknown as jest.Mocked<
        Query<HydratedDocument<TestDocument>[], HydratedDocument<TestDocument>>
      >
      mockModel.find.mockReturnValue(mockQuery)
    })

    it('should return paginated documents and total count', async () => {
      const filter: FilterQuery<TestDocument> = { age: { $gt: 5 } }
      const options = { skip: 0, limit: 10, sort: { createdAt: -1 as 1 | -1 } }
      const mockDocs = [
        { _id: '1', name: 'test1', createdAt: new Date(), age: 10 },
      ] as HydratedDocument<TestDocument>[]
      mockQuery.exec.mockResolvedValue(mockDocs)
      mockModel.countDocuments.mockResolvedValue(1)

      const result = await repository.findWithPagination(filter, options)

      expect(result).toEqual({ documents: mockDocs, total: 1 })
      expect(mockModel.find).toHaveBeenCalledWith(filter)
      expect(mockQuery.skip).toHaveBeenCalledWith(0)
      expect(mockQuery.limit).toHaveBeenCalledWith(10)
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 })
      expect(mockQuery.exec).toHaveBeenCalled()
      expect(mockModel.countDocuments).toHaveBeenCalledWith(filter)
    })

    it('should handle populate as string', async () => {
      const options = { populate: 'field' }
      mockQuery.exec.mockResolvedValue([])
      mockModel.countDocuments.mockResolvedValue(0)

      await repository.findWithPagination({}, options)

      expect(mockQuery.populate).toHaveBeenCalledWith('field')
    })

    it('should handle populate as array', async () => {
      const options = { populate: ['field1', 'field2'] }
      mockQuery.exec.mockResolvedValue([])
      mockModel.countDocuments.mockResolvedValue(0)

      await repository.findWithPagination({}, options)

      expect(mockQuery.populate).toHaveBeenCalledWith('field1')
      expect(mockQuery.populate).toHaveBeenCalledWith('field2')
    })

    it('should use default options if not provided', async () => {
      mockQuery.exec.mockResolvedValue([])
      mockModel.countDocuments.mockResolvedValue(0)

      await repository.findWithPagination()

      expect(mockQuery.skip).toHaveBeenCalledWith(0)
      expect(mockQuery.limit).toHaveBeenCalledWith(10)
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 })
    })

    it('should throw error and log if exception occurs', async () => {
      const error = new Error('pagination error')
      mockQuery.exec.mockRejectedValue(error)

      await expect(repository.findWithPagination()).rejects.toThrow(error)
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Error finding documents with pagination:',
        error,
      )
    })
  })

  describe('create', () => {
    it('should create and return the document', async () => {
      const data: Partial<TestDocument> = { name: 'new', age: 20 }
      const mockDoc = {
        _id: '1',
        name: 'new',
        age: 20,
        createdAt: new Date(),
        __v: 0,
      } as HydratedDocument<TestDocument>
      ;(
        mockModel.create as unknown as jest.Mock<
          Promise<HydratedDocument<TestDocument>>,
          [Partial<TestDocument>]
        >
      ).mockResolvedValue(mockDoc)

      const result = await repository.create(data)

      expect(result).toEqual(mockDoc)
      expect(mockModel.create).toHaveBeenCalledWith(data)
      expect(mockLoggerLog).toHaveBeenCalledWith(
        `Created new Test document with id '1'`,
      )
    })

    it('should throw error and log if exception occurs', async () => {
      const data: Partial<TestDocument> = { name: 'new' }
      const error = new Error('create error')
      mockModel.create.mockRejectedValue(error)

      await expect(repository.create(data)).rejects.toThrow(error)
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Error creating Test document:',
        error,
      )
    })
  })

  describe('update', () => {
    it('should update and return the document', async () => {
      const id = '1'
      const data: UpdateQuery<TestDocument> = { name: 'updated' }
      const mockDoc = {
        _id: '1',
        name: 'updated',
        createdAt: new Date(),
        age: 10,
      } as HydratedDocument<TestDocument>
      mockModel.findByIdAndUpdate.mockResolvedValue(mockDoc)

      const result = await repository.update(id, data)

      expect(result).toEqual(mockDoc)
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { $set: { name: 'updated' } },
        { new: true, runValidators: true },
      )
      expect(mockLoggerLog).toHaveBeenCalledWith(
        `Updated Test document with id '1'`,
      )
    })

    it('should handle undefined values as $unset', async () => {
      const id = '1'
      const data: UpdateQuery<TestDocument> = {
        name: 'updated',
        age: undefined,
      }
      const mockDoc = {
        _id: '1',
        name: 'updated',
        createdAt: new Date(),
      } as HydratedDocument<TestDocument>
      mockModel.findByIdAndUpdate.mockResolvedValue(mockDoc)

      await repository.update(id, data)

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { $set: { name: 'updated' }, $unset: { age: '' } },
        { new: true, runValidators: true },
      )
    })

    it('should return null if not found and log warn', async () => {
      const id = '1'
      const data: UpdateQuery<TestDocument> = { name: 'updated' }
      mockModel.findByIdAndUpdate.mockResolvedValue(null)

      const result = await repository.update(id, data)

      expect(result).toBeNull()
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        `No Test document found with id '1' to update`,
      )
    })

    it('should throw error and log if exception occurs', async () => {
      const id = '1'
      const data: UpdateQuery<TestDocument> = { name: 'updated' }
      const error = new Error('update error')
      mockModel.findByIdAndUpdate.mockRejectedValue(error)

      await expect(repository.update(id, data)).rejects.toThrow(error)
      expect(mockLoggerError).toHaveBeenCalledWith(
        `Error updating Test document with id '1':`,
        error,
      )
    })
  })

  describe('updateMany', () => {
    it('should update multiple documents and return modified count', async () => {
      const filter: FilterQuery<TestDocument> = { age: { $gt: 5 } }
      const data: UpdateQuery<TestDocument> = { name: 'updated' }
      mockModel.updateMany.mockResolvedValue({
        modifiedCount: 2,
      } as UpdateWriteOpResult)

      const result = await repository.updateMany(filter, data)

      expect(result).toBe(2)
      expect(mockModel.updateMany).toHaveBeenCalledWith(filter, data, {
        runValidators: true,
      })
      expect(mockLoggerLog).toHaveBeenCalledWith('Updated 2 Test documents')
    })

    it('should return 0 if no documents updated', async () => {
      mockModel.updateMany.mockResolvedValue({
        modifiedCount: 0,
      } as UpdateWriteOpResult)

      const result = await repository.updateMany({}, {})

      expect(result).toBe(0)
      expect(mockLoggerLog).toHaveBeenCalledWith('Updated 0 Test documents')
    })

    it('should throw error and log if exception occurs', async () => {
      const filter: FilterQuery<TestDocument> = { age: { $gt: 5 } }
      const data: UpdateQuery<TestDocument> = { name: 'updated' }
      const error = new Error('updateMany error')
      mockModel.updateMany.mockRejectedValue(error)

      await expect(repository.updateMany(filter, data)).rejects.toThrow(error)
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Error updating Test documents:',
        error,
      )
    })
  })

  describe('delete', () => {
    it('should delete the document and return true', async () => {
      const id = '1'
      const mockDoc = {
        _id: '1',
        name: 'test',
        createdAt: new Date(),
        age: 10,
      } as HydratedDocument<TestDocument>
      mockModel.findByIdAndDelete.mockResolvedValue(mockDoc)

      const result = await repository.delete(id)

      expect(result).toBe(true)
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id)
      expect(mockLoggerLog).toHaveBeenCalledWith(
        `Deleted Test document with id '1'`,
      )
    })

    it('should return false if not found and log warn', async () => {
      const id = '1'
      mockModel.findByIdAndDelete.mockResolvedValue(null)

      const result = await repository.delete(id)

      expect(result).toBe(false)
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        `No Test document found with id '1' to delete`,
      )
    })

    it('should throw error and log if exception occurs', async () => {
      const id = '1'
      const error = new Error('delete error')
      mockModel.findByIdAndDelete.mockRejectedValue(error)

      await expect(repository.delete(id)).rejects.toThrow(error)
      expect(mockLoggerError).toHaveBeenCalledWith(
        `Error deleting Test document with id '1':`,
        error,
      )
    })
  })

  describe('deleteMany', () => {
    it('should delete multiple documents and return deleted count', async () => {
      const filter: FilterQuery<TestDocument> = { age: { $gt: 5 } }
      mockModel.deleteMany.mockResolvedValue({
        acknowledged: true,
        deletedCount: 3,
      })

      const result = await repository.deleteMany(filter)

      expect(result).toBe(3)
      expect(mockModel.deleteMany).toHaveBeenCalledWith(filter)
      expect(mockLoggerLog).toHaveBeenCalledWith('Deleted 3 Test documents')
    })

    it('should return 0 if no documents deleted', async () => {
      mockModel.deleteMany.mockResolvedValue({
        acknowledged: true,
        deletedCount: 0,
      })

      const result = await repository.deleteMany({})

      expect(result).toBe(0)
      expect(mockLoggerLog).toHaveBeenCalledWith('Deleted 0 Test documents')
    })

    it('should throw error and log if exception occurs', async () => {
      const filter: FilterQuery<TestDocument> = { age: { $gt: 5 } }
      const error = new Error('deleteMany error')
      mockModel.deleteMany.mockRejectedValue(error)

      await expect(repository.deleteMany(filter)).rejects.toThrow(error)
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Error deleting Test documents:',
        error,
      )
    })
  })

  describe('count', () => {
    it('should return the count of documents', async () => {
      const filter: FilterQuery<TestDocument> = { age: { $gt: 5 } }
      mockModel.countDocuments.mockResolvedValue(5)

      const result = await repository.count(filter)

      expect(result).toBe(5)
      expect(mockModel.countDocuments).toHaveBeenCalledWith(filter)
    })

    it('should return 0 if no documents', async () => {
      mockModel.countDocuments.mockResolvedValue(0)

      const result = await repository.count()

      expect(result).toBe(0)
      expect(mockModel.countDocuments).toHaveBeenCalledWith({})
    })

    it('should throw error and log if exception occurs', async () => {
      const error = new Error('count error')
      mockModel.countDocuments.mockRejectedValue(error)

      await expect(repository.count()).rejects.toThrow(error)
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Error counting Test documents:',
        error,
      )
    })
  })

  describe('exists', () => {
    it('should return true if document exists', async () => {
      const filter: FilterQuery<TestDocument> = { name: 'test' }
      mockModel.exists.mockResolvedValue({ _id: '1' })

      const result = await repository.exists(filter)

      expect(result).toBe(true)
      expect(mockModel.exists).toHaveBeenCalledWith(filter)
    })

    it('should return false if document does not exist', async () => {
      const filter: FilterQuery<TestDocument> = { name: 'test' }
      mockModel.exists.mockResolvedValue(null)

      const result = await repository.exists(filter)

      expect(result).toBe(false)
      expect(mockModel.exists).toHaveBeenCalledWith(filter)
    })

    it('should throw error and log if exception occurs', async () => {
      const filter: FilterQuery<TestDocument> = { name: 'test' }
      const error = new Error('exists error')
      mockModel.exists.mockRejectedValue(error)

      await expect(repository.exists(filter)).rejects.toThrow(error)
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Error checking Test document existence:',
        error,
      )
    })
  })
})
