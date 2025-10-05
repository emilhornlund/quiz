import { Injectable, Logger } from '@nestjs/common'
import { FilterQuery, Model, UpdateQuery } from 'mongoose'

import { IBaseRepository } from './base-repository.interface'
/**
 * Abstract base repository providing common CRUD operations
 */
@Injectable()
export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected readonly logger: Logger
  protected constructor(
    protected readonly model: Model<T>,
    protected readonly modelName: string,
  ) {
    this.logger = new Logger(`${modelName}Repository`)
  }
  /**
   * Find a document by its ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const document = await this.model.findById(id)
      if (!document) {
        this.logger.debug(`Document with id '${id}' not found`)
      }
      return document
    } catch (error) {
      this.logger.error(`Error finding document by id '${id}':`, error)
      throw error
    }
  }
  /**
   * Find a single document matching the filter
   */
  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    try {
      const document = await this.model.findOne(filter)
      if (!document) {
        this.logger.debug(`No document found matching filter:`, filter)
      }
      return document
    } catch (error) {
      this.logger.error(`Error finding document with filter:`, error)
      throw error
    }
  }
  /**
   * Find multiple documents matching the filter
   */
  async find(filter: FilterQuery<T> = {}): Promise<T[]> {
    try {
      return await this.model.find(filter)
    } catch (error) {
      this.logger.error(`Error finding documents with filter:`, error)
      throw error
    }
  }
  /**
   * Find documents with pagination
   */
  async findWithPagination(
    filter: FilterQuery<T> = {},
    options: {
      skip?: number
      limit?: number
      sort?: Record<string, 1 | -1>
      populate?: string | string[]
    } = {},
  ): Promise<{ documents: T[]; total: number }> {
    try {
      const {
        skip = 0,
        limit = 10,
        sort = { createdAt: -1 as 1 | -1 },
        populate,
      } = options
      const query = this.model.find(filter).skip(skip).limit(limit).sort(sort)
      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach((field) => query.populate(field))
        } else {
          query.populate(populate)
        }
      }
      const [documents, total] = await Promise.all([
        query.exec(),
        this.model.countDocuments(filter),
      ])
      return { documents, total }
    } catch (error) {
      this.logger.error(`Error finding documents with pagination:`, error)
      throw error
    }
  }
  /**
   * Create a new document
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      const document = await this.model.create(data)
      this.logger.log(
        `Created new ${this.modelName} document with id '${document._id}'`,
      )
      return document
    } catch (error) {
      this.logger.error(`Error creating ${this.modelName} document:`, error)
      throw error
    }
  }
  /**
   * Update a document by ID
   */
  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    try {
      const updateOps = this.buildUpdateOps(data)
      const document = await this.model.findByIdAndUpdate(id, updateOps, {
        new: true,
        runValidators: true,
      })
      if (document) {
        this.logger.log(`Updated ${this.modelName} document with id '${id}'`)
      } else {
        this.logger.warn(
          `No ${this.modelName} document found with id '${id}' to update`,
        )
      }
      return document
    } catch (error) {
      this.logger.error(
        `Error updating ${this.modelName} document with id '${id}':`,
        error,
      )
      throw error
    }
  }
  /**
   * Update multiple documents matching the filter
   */
  async updateMany(
    filter: FilterQuery<T>,
    data: UpdateQuery<T>,
  ): Promise<number> {
    try {
      const result = await this.model.updateMany(filter, data, {
        runValidators: true,
      })
      this.logger.log(
        `Updated ${result.modifiedCount} ${this.modelName} documents`,
      )
      return result.modifiedCount
    } catch (error) {
      this.logger.error(`Error updating ${this.modelName} documents:`, error)
      throw error
    }
  }
  /**
   * Delete a document by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id)
      if (result) {
        this.logger.log(`Deleted ${this.modelName} document with id '${id}'`)
        return true
      } else {
        this.logger.warn(
          `No ${this.modelName} document found with id '${id}' to delete`,
        )
        return false
      }
    } catch (error) {
      this.logger.error(
        `Error deleting ${this.modelName} document with id '${id}':`,
        error,
      )
      throw error
    }
  }
  /**
   * Delete multiple documents matching the filter
   */
  async deleteMany(filter: FilterQuery<T>): Promise<number> {
    try {
      const result = await this.model.deleteMany(filter)
      this.logger.log(
        `Deleted ${result.deletedCount} ${this.modelName} documents`,
      )
      return result.deletedCount
    } catch (error) {
      this.logger.error(`Error deleting ${this.modelName} documents:`, error)
      throw error
    }
  }
  /**
   * Count documents matching the filter
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filter)
    } catch (error) {
      this.logger.error(`Error counting ${this.modelName} documents:`, error)
      throw error
    }
  }
  /**
   * Check if a document exists matching the filter
   */
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    try {
      const exists = await this.model.exists(filter)
      return !!exists
    } catch (error) {
      this.logger.error(
        `Error checking ${this.modelName} document existence:`,
        error,
      )
      throw error
    }
  }
  /**
   * Builds an update operations object by splitting the input data into
   * MongoDB $set and $unset operators.
   *
   * This handles fields set to `undefined` by converting them to $unset
   * operations, which removes the field from the document. This preserves
   * the behavior from pre-refactor code (e.g., using doc.set() + save()),
   * where setting a field to undefined would unset it. Direct Mongoose
   * update methods (like findByIdAndUpdate or updateMany) ignore undefined
   * values by default, so this explicit split ensures unset works as expected.
   *
   * If the input data already contains MongoDB operators (e.g., $inc), this
   * may not handle them—add a guard if needed in calling methods.
   *
   * @param data - The update data, potentially containing undefined values.
   * @returns An object with $set and/or $unset, or an empty object if no changes.
   */
  private buildUpdateOps(data: UpdateQuery<T>): UpdateQuery<T> {
    const $set: { [K in keyof T]?: T[K] } = {}
    const $unset: { [K in keyof T]?: string } = {} // Use string for $unset values ('' is conventional)
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) {
        $unset[key as keyof T] = ''
      } else {
        $set[key as keyof T] = value
      }
    }
    return {
      ...(Object.keys($set).length > 0 ? { $set } : {}),
      ...(Object.keys($unset).length > 0 ? { $unset } : {}),
    }
  }
}
