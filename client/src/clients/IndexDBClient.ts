export interface IndexDBConfig {
  dbName: string;
  version: number;
  objectStores: {
    name: string;
    keyPath?: string;
    autoIncrement?: boolean;
    indexes?: {
      name: string;
      keyPath: string | string[];
      unique?: boolean;
    }[];
  }[];
}

class IndexDBClient {
  private db: IDBDatabase;

  private constructor(db: IDBDatabase) {
    this.db = db;
  }

  static open(config: IndexDBConfig): Promise<IndexDBClient> {
    return new Promise((resolve, reject) => {
      console.log(`Opening IndexedDB: ${config.dbName} v${config.version}`);
      const request = indexedDB.open(config.dbName, config.version);

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log(`IndexedDB opened successfully: ${config.dbName}`);
        resolve(new IndexDBClient(request.result));
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        for (const storeConfig of config.objectStores) {
          if (db.objectStoreNames.contains(storeConfig.name)) {
            continue;
          }

          const options: IDBObjectStoreParameters = {};
          if (storeConfig.keyPath) options.keyPath = storeConfig.keyPath;
          if (storeConfig.autoIncrement) options.autoIncrement = storeConfig.autoIncrement;

          const store = db.createObjectStore(storeConfig.name, options);

          if (storeConfig.indexes) {
            for (const indexConfig of storeConfig.indexes) {
              store.createIndex(
                indexConfig.name,
                indexConfig.keyPath,
                { unique: indexConfig.unique || false }
              );
            }
          }
        }
      };
    });
  }

  close(): void {
    this.db.close();
  }

  clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  add<T>(storeName: string, item: T, key?: IDBValidKey): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = key ? store.add(item, key) : store.add(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  put<T>(storeName: string, item: T, key?: IDBValidKey): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = key ? store.put(item, key) : store.put(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  delete(storeName: string, key: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  query<T>(
    storeName: string,
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.openCursor(query, direction);
      const results: T[] = [];

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
    });
  }

  getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  queryPage<T>(
    storeName: string,
    pageSize: number,
    cursor?: IDBValidKey,
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection,
    indexName?: string
  ): Promise<{ items: T[], nextCursor?: IDBValidKey }> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const source = indexName ? store.index(indexName) : store;
      
      // If cursor is provided, create a key range starting after it
      let keyRange = query;
      if (cursor) {
        keyRange = IDBKeyRange.lowerBound(cursor, true); // exclusive
      }
      
      const request = source.openCursor(keyRange, direction);
      const results: T[] = [];
      let count = 0;
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const cursorResult = request.result;
        
        if (!cursorResult || count >= pageSize) {
          resolve({ items: results, nextCursor: undefined });
          return;
        }
        
        results.push(cursorResult.value);
        count++;
        cursorResult.continue();
      };
    });
  }

  transaction(
    storeNames: string | string[],
    mode: IDBTransactionMode = 'readonly'
  ): TransactionStore {
    const transaction = this.db.transaction(storeNames, mode);
    return new TransactionStore(transaction);
  }
}

class TransactionStore {
  private transaction: IDBTransaction;

  constructor(transaction: IDBTransaction) {
    this.transaction = transaction;
  }

  complete(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.transaction.oncomplete = () => resolve();
      this.transaction.onerror = () => reject(this.transaction.error);
      this.transaction.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  abort(): void {
    this.transaction.abort();
  }

  add<T>(storeName: string, item: T, key?: IDBValidKey): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const store = this.transaction.objectStore(storeName);
      const request = key ? store.add(item, key) : store.add(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  put<T>(storeName: string, item: T, key?: IDBValidKey): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const store = this.transaction.objectStore(storeName);
      const request = key ? store.put(item, key) : store.put(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  delete(storeName: string, key: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export default IndexDBClient;
