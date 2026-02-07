import { Class, CreateClassInput } from '../types/class';

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
