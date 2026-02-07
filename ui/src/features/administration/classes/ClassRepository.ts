import { Class, CreateClassInput } from './types';

const DB_NAME = 'notenbank';
const DB_VERSION = 1;
const STORE_NAME = 'classes';

/**
 * Repository interface for class data operations
 */
export interface ClassRepository {
  findAll(): Promise<Class[]>;
  findById(id: string): Promise<Class | null>;
  create(data: CreateClassInput): Promise<Class>;
  update(id: string, data: Partial<Class>): Promise<Class>;
  delete(id: string): Promise<void>;
}

/**
 * IndexedDB implementation of ClassRepository
 */
export class IndexedDBClassRepository implements ClassRepository {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  /**
   * Initialize IndexedDB database and object store
   */
  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create classes object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  /**
   * Get object store for transactions
   */
  private async getStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.dbPromise;
    const transaction = db.transaction(STORE_NAME, mode);
    return transaction.objectStore(STORE_NAME);
  }

  /**
   * Retrieve all classes
   */
  async findAll(): Promise<Class[]> {
    const store = await this.getStore('readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const classes = request.result.map(this.deserializeClass);
        resolve(classes);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Find a class by ID
   */
  async findById(id: string): Promise<Class | null> {
    const store = await this.getStore('readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? this.deserializeClass(result) : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Create a new class
   */
  async create(data: CreateClassInput): Promise<Class> {
    const now = new Date();
    const newClass: Class = {
      id: crypto.randomUUID(),
      name: data.name,
      createdAt: now,
      updatedAt: now,
    };

    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(this.serializeClass(newClass));
      request.onsuccess = () => resolve(newClass);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update an existing class
   */
  async update(id: string, data: Partial<Class>): Promise<Class> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Class with id ${id} not found`);
    }

    const updated: Class = {
      ...existing,
      ...data,
      id: existing.id, // Ensure ID cannot be changed
      updatedAt: new Date(),
    };

    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(this.serializeClass(updated));
      request.onsuccess = () => resolve(updated);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a class
   */
  async delete(id: string): Promise<void> {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Serialize class for storage (convert Date to ISO string)
   */
  private serializeClass(classObj: Class): any {
    return {
      ...classObj,
      createdAt: classObj.createdAt.toISOString(),
      updatedAt: classObj.updatedAt.toISOString(),
    };
  }

  /**
   * Deserialize class from storage (convert ISO string to Date)
   */
  private deserializeClass(data: any): Class {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }
}

/**
 * Singleton instance of the repository (lazy initialization to avoid test issues)
 */
let _classRepository: IndexedDBClassRepository | null = null;
export const classRepository = {
  get findAll() { return this._ensureInstance().findAll.bind(this._ensureInstance()); },
  get findById() { return this._ensureInstance().findById.bind(this._ensureInstance()); },
  get create() { return this._ensureInstance().create.bind(this._ensureInstance()); },
  get update() { return this._ensureInstance().update.bind(this._ensureInstance()); },
  get delete() { return this._ensureInstance().delete.bind(this._ensureInstance()); },
  _ensureInstance() {
    if (!_classRepository) {
      _classRepository = new IndexedDBClassRepository();
    }
    return _classRepository;
  }
};

// Tests
if (import.meta.vitest) {
  const { describe, it, expect, beforeEach } = import.meta.vitest;
  const { IDBFactory } = await import('fake-indexeddb');

  describe('IndexedDBClassRepository', () => {
    let repository: IndexedDBClassRepository;

    beforeEach(() => {
      // Reset IndexedDB for each test
      globalThis.indexedDB = new IDBFactory();
      repository = new IndexedDBClassRepository();
    });

    describe('findAll', () => {
      it('returns empty array when no classes exist', async () => {
        const classes = await repository.findAll();
        expect(classes).toEqual([]);
      });

      it('returns all classes', async () => {
        // Create test data
        const class1 = await repository.create({ name: 'Class 5A' });
        const class2 = await repository.create({ name: 'Class 5B' });

        const classes = await repository.findAll();
        expect(classes).toHaveLength(2);
        expect(classes).toContainEqual(class1);
        expect(classes).toContainEqual(class2);
      });
    });

    describe('findById', () => {
      it('returns null when class does not exist', async () => {
        const result = await repository.findById('non-existent-id');
        expect(result).toBeNull();
      });

      it('returns the class when it exists', async () => {
        const created = await repository.create({ name: 'Class 5A' });
        const found = await repository.findById(created.id);
        expect(found).toEqual(created);
      });
    });

    describe('create', () => {
      it('creates a class with generated id and timestamps', async () => {
        const input = { name: 'Class 5A' };
        const created = await repository.create(input);

        expect(created.id).toBeDefined();
        expect(created.name).toBe('Class 5A');
        expect(created.createdAt).toBeInstanceOf(Date);
        expect(created.updatedAt).toBeInstanceOf(Date);
        expect(created.createdAt).toEqual(created.updatedAt);
      });

      it('stores and retrieves the class correctly', async () => {
        const created = await repository.create({ name: 'Class 5A' });
        const retrieved = await repository.findById(created.id);
        expect(retrieved).toEqual(created);
      });

      it.each([
        { name: 'Class 5A' },
        { name: 'Grade 10B' },
        { name: 'Year 7C' },
      ])('creates class with name "$name"', async (input) => {
        const created = await repository.create(input);
        expect(created.name).toBe(input.name);

        const retrieved = await repository.findById(created.id);
        expect(retrieved?.name).toBe(input.name);
      });
    });

    describe('update', () => {
      it('updates an existing class', async () => {
        const created = await repository.create({ name: 'Class 5A' });

        // Wait a bit to ensure updatedAt is different
        await new Promise(resolve => setTimeout(resolve, 10));

        const updated = await repository.update(created.id, { name: 'Class 5B' });

        expect(updated.id).toBe(created.id);
        expect(updated.name).toBe('Class 5B');
        expect(updated.createdAt).toEqual(created.createdAt);
        expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
      });

      it('throws error when class does not exist', async () => {
        await expect(
          repository.update('non-existent-id', { name: 'Updated' })
        ).rejects.toThrow('Class with id non-existent-id not found');
      });

      it('does not allow changing the id', async () => {
        const created = await repository.create({ name: 'Class 5A' });
        const originalId = created.id;

        const updated = await repository.update(created.id, {
          id: 'different-id',
          name: 'Class 5B'
        } as any);

        expect(updated.id).toBe(originalId);
      });

      it('retrieves updated class correctly', async () => {
        const created = await repository.create({ name: 'Class 5A' });
        await repository.update(created.id, { name: 'Class 5B' });

        const retrieved = await repository.findById(created.id);
        expect(retrieved?.name).toBe('Class 5B');
      });
    });

    describe('delete', () => {
      it('deletes an existing class', async () => {
        const created = await repository.create({ name: 'Class 5A' });

        await repository.delete(created.id);

        const found = await repository.findById(created.id);
        expect(found).toBeNull();
      });

      it('does not throw when deleting non-existent class', async () => {
        await expect(
          repository.delete('non-existent-id')
        ).resolves.toBeUndefined();
      });

      it('removes class from findAll results', async () => {
        const class1 = await repository.create({ name: 'Class 5A' });
        const class2 = await repository.create({ name: 'Class 5B' });

        await repository.delete(class1.id);

        const classes = await repository.findAll();
        expect(classes).toHaveLength(1);
        expect(classes).toContainEqual(class2);
        expect(classes).not.toContainEqual(class1);
      });
    });

    describe('date serialization', () => {
      it('preserves dates correctly through storage', async () => {
        const created = await repository.create({ name: 'Class 5A' });
        const originalCreatedAt = created.createdAt.getTime();
        const originalUpdatedAt = created.updatedAt.getTime();

        const retrieved = await repository.findById(created.id);

        expect(retrieved?.createdAt.getTime()).toBe(originalCreatedAt);
        expect(retrieved?.updatedAt.getTime()).toBe(originalUpdatedAt);
      });
    });
  });
}
