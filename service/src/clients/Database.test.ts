import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';


describe('Database', () => {
  let consoleSpy: any;

  beforeEach(() => {
    // Mock console.warn to capture error messages
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Reset modules for clean tests
    vi.resetModules();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Module exports', () => {
    it('should export a database instance as default', async () => {
      const { default: database } = await import('./Database');
      
      expect(database).toBeDefined();
      expect(typeof database).toBe('object');
    });

    it('should export database with collection method', async () => {
      const { default: database } = await import('./Database');
      
      expect(database).toBeDefined();
      expect(typeof database.collection).toBe('function');
    });

    it('should return same instance on multiple imports', async () => {
      const module1 = await import('./Database');
      const module2 = await import('./Database');
      
      expect(module1.default).toBe(module2.default);
    });
  });

  describe('Error handling', () => {
    it('should handle MongoDB connection errors gracefully', async () => {
      // Mock MongoDB to throw connection error
      vi.doMock('mongodb', () => ({
        MongoClient: vi.fn(() => ({
          connect: vi.fn().mockRejectedValue(new Error('Connection failed')),
          db: vi.fn().mockReturnValue({ collection: vi.fn() }),
          close: vi.fn(),
        })),
      }));

      // Import should not throw despite connection failure
      await expect(import('./Database')).resolves.toBeDefined();
    });

    it('should provide database instance even with failed connections', async () => {
      // Mock MongoDB with failing connection
      vi.doMock('mongodb', () => ({
        MongoClient: vi.fn(() => ({
          connect: vi.fn().mockRejectedValue(new Error('Connection failed')),
          db: vi.fn().mockReturnValue({ 
            collection: vi.fn().mockReturnValue({
              insertOne: vi.fn(),
              findOne: vi.fn(),
              updateOne: vi.fn(),
              deleteOne: vi.fn(),
            })
          }),
          close: vi.fn(),
        })),
      }));

      const { default: database } = await import('./Database');
      
      expect(database).toBeDefined();
      expect(typeof database).toBe('object');
      expect(typeof database.collection).toBe('function');
    });
  });

  describe('Configuration', () => {
    it('should initialize without errors', async () => {
      // Test that the module can be imported successfully
      const databaseModule = await import('./Database');
      
      expect(databaseModule).toBeDefined();
      expect(databaseModule.default).toBeDefined();
    });
  });

  describe('Database operations', () => {
    it('should provide database instance that supports collection operations', async () => {
      const { default: database } = await import('./Database');
      
      // Should be able to get collections
      const collection = database.collection('test');
      expect(collection).toBeDefined();
    });

    it('should handle database selection', async () => {
      // Mock successful MongoDB setup
      vi.doMock('mongodb', () => ({
        MongoClient: vi.fn(() => ({
          connect: vi.fn().mockResolvedValue(undefined),
          db: vi.fn().mockReturnValue({
            collection: vi.fn().mockReturnValue({
              insertOne: vi.fn(),
              findOne: vi.fn(),
              updateOne: vi.fn(),
              deleteOne: vi.fn(),
            }),
          }),
          close: vi.fn(),
        })),
      }));

      const { default: database } = await import('./Database');
      
      expect(database).toBeDefined();
      expect(typeof database.collection).toBe('function');
    });
  });

  describe('DatabaseManager functionality', () => {
    it('should test basic database manager methods', async () => {
      // Mock successful MongoDB setup
      const mockConnect = vi.fn().mockResolvedValue(undefined);
      const mockDb = vi.fn().mockReturnValue({
        collection: vi.fn().mockReturnValue({
          insertOne: vi.fn(),
          findOne: vi.fn(),
        }),
      });
      const mockClose = vi.fn().mockResolvedValue(undefined);

      vi.doMock('mongodb', () => ({
        MongoClient: vi.fn().mockImplementation(() => ({
          connect: mockConnect,
          db: mockDb,
          close: mockClose,
        })),
      }));

      // Import fresh module to test DatabaseManager methods
      const { default: DatabaseModule } = await import('./Database');
      
      expect(DatabaseModule).toBeDefined();
      expect(typeof DatabaseModule.collection).toBe('function');
    });

    it('should handle database operations', async () => {
      // Test that database instance provides expected interface
      const { default: database } = await import('./Database');
      
      expect(database).toBeDefined();
      expect(typeof database.collection).toBe('function');
      
      // Test collection creation
      const collection = database.collection('testCollection');
      expect(collection).toBeDefined();
    });
  });

  describe('Resilience', () => {
    it('should not throw during module initialization', async () => {
      // Test module import without any mocking (using real dependencies)
      await expect(import('./Database')).resolves.toBeDefined();
    });

    it('should handle client instantiation errors', async () => {
      // Mock MongoDB constructor to throw
      vi.doMock('mongodb', () => ({
        MongoClient: vi.fn(() => {
          throw new Error('Client creation failed');
        }),
      }));

      // Should not throw during import
      await expect(import('./Database')).resolves.toBeDefined();
    });

    it('should handle logger initialization errors', async () => {
      // Mock Logger to throw
      vi.doMock('@nestjs/common', () => ({
        Logger: vi.fn(() => {
          throw new Error('Logger creation failed');
        }),
      }));

      // Should not throw during import
      await expect(import('./Database')).resolves.toBeDefined();
    });
  });
});
