import type { ZodType } from 'zod'
import { BaseEntity, CreateInput } from './RepositoryTypes'

export type RepositorySchemas<
  T extends BaseEntity,
  TCreate = CreateInput<T>,
> = {
  entity: ZodType<T>
  create: ZodType<TCreate>
  update?: ZodType<Partial<T>>
}

/**
 * Generic repository interface for CRUD operations
 *
 * @template T - The entity type (must extend BaseEntity)
 * @template TCreate - The creation input type (defaults to CreateInput<T>)
 */
export interface Repository<T extends BaseEntity, TCreate = CreateInput<T>> {
  schemas: RepositorySchemas<T, TCreate>
  /**
   * Retrieve all entities
   */
  findAll(): Promise<T[]>

  /**
   * Find an entity by ID
   */
  findById(id: string): Promise<T | null>

  /**
   * Create a new entity
   */
  create(data: TCreate): Promise<T>

  /**
   * Update an existing entity
   */
  update(id: string, data: Partial<T>): Promise<T>

  /**
   * Delete an entity
   */
  delete(id: string): Promise<void>
}
