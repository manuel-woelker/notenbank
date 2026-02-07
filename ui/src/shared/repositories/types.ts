/**
 * Base entity interface that all entities must extend
 */
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Type utility to extract creation input from an entity type
 * Removes id, createdAt, and updatedAt fields
 */
export type CreateInput<T extends BaseEntity> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt'
>

/**
 * Type utility to convert Date fields to string for serialization
 */
export type Serialized<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K]
}
