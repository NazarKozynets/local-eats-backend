import { RedisCacheService } from './redis-cache.service';
import { ConfigService } from '@nestjs/config';

function makeClient(overrides: Partial<Record<string, jest.Mock>> = {}) {
    return {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        scanIterator: jest.fn(),
        ...overrides,
    } as any;
}

function makeConfig(prefix = 'test') {
    return { get: jest.fn().mockReturnValue(prefix) } as unknown as ConfigService;
}

describe('RedisCacheService', () => {
    describe('get', () => {
        it('returns parsed JSON value on hit', async () => {
            // Arrange
            const client = makeClient({ get: jest.fn().mockResolvedValue(JSON.stringify({ x: 1 })) });
            const svc = new RedisCacheService(client, makeConfig());

            // Act
            const result = await svc.get('mykey');

            // Assert
            expect(result).toEqual({ x: 1 });
            expect(client.get).toHaveBeenCalledWith('test:mykey');
        });

        it('returns null on cache miss', async () => {
            // Arrange
            const client = makeClient({ get: jest.fn().mockResolvedValue(null) });
            const svc = new RedisCacheService(client, makeConfig());

            // Act
            const result = await svc.get('mykey');

            // Assert
            expect(result).toBeNull();
        });

        it('returns null and swallows redis errors', async () => {
            // Arrange
            const client = makeClient({ get: jest.fn().mockRejectedValue(new Error('conn fail')) });
            const svc = new RedisCacheService(client, makeConfig());

            // Act & Assert
            await expect(svc.get('mykey')).resolves.toBeNull();
        });
    });

    describe('set', () => {
        it('serializes value to JSON with EX ttl', async () => {
            // Arrange
            const client = makeClient({ set: jest.fn().mockResolvedValue('OK') });
            const svc = new RedisCacheService(client, makeConfig());

            // Act
            await svc.set('k', { a: 2 }, 30);

            // Assert
            expect(client.set).toHaveBeenCalledWith('test:k', JSON.stringify({ a: 2 }), { EX: 30 });
        });

        it('swallows redis errors', async () => {
            // Arrange
            const client = makeClient({ set: jest.fn().mockRejectedValue(new Error('fail')) });
            const svc = new RedisCacheService(client, makeConfig());

            // Act & Assert
            await expect(svc.set('k', {}, 10)).resolves.toBeUndefined();
        });
    });

    describe('delete', () => {
        it('calls del with prefixed key', async () => {
            // Arrange
            const client = makeClient({ del: jest.fn().mockResolvedValue(1) });
            const svc = new RedisCacheService(client, makeConfig());

            // Act
            await svc.delete('some:key');

            // Assert
            expect(client.del).toHaveBeenCalledWith('test:some:key');
        });
    });

    describe('deleteByPattern', () => {
        it('scans and deletes all matching keys', async () => {
            // Arrange
            async function* fakeIterator() {
                yield 'test:catalog:public:r1';
                yield 'test:catalog:public:r2';
            }
            const client = makeClient({
                scanIterator: jest.fn().mockReturnValue(fakeIterator()),
                del: jest.fn().mockResolvedValue(2),
            });
            const svc = new RedisCacheService(client, makeConfig());

            // Act
            await svc.deleteByPattern('catalog:public:*');

            // Assert
            expect(client.del).toHaveBeenCalledWith('test:catalog:public:r1', 'test:catalog:public:r2');
        });

        it('skips del when no keys match', async () => {
            // Arrange
            async function* emptyIterator() {}
            const client = makeClient({
                scanIterator: jest.fn().mockReturnValue(emptyIterator()),
                del: jest.fn(),
            });
            const svc = new RedisCacheService(client, makeConfig());

            // Act
            await svc.deleteByPattern('catalog:public:*');

            // Assert
            expect(client.del).not.toHaveBeenCalled();
        });
    });

    describe('remember', () => {
        it('returns cached value without calling factory', async () => {
            // Arrange
            const client = makeClient({ get: jest.fn().mockResolvedValue(JSON.stringify('cached')) });
            const svc = new RedisCacheService(client, makeConfig());
            const factory = jest.fn();

            // Act
            const result = await svc.remember('k', 60, factory);

            // Assert
            expect(result).toBe('cached');
            expect(factory).not.toHaveBeenCalled();
        });

        it('calls factory and stores result on cache miss', async () => {
            // Arrange
            const client = makeClient({
                get: jest.fn().mockResolvedValue(null),
                set: jest.fn().mockResolvedValue('OK'),
            });
            const svc = new RedisCacheService(client, makeConfig());
            const factory = jest.fn().mockResolvedValue('fresh');

            // Act
            const result = await svc.remember('k', 60, factory);

            // Assert
            expect(result).toBe('fresh');
            expect(client.set).toHaveBeenCalledWith('test:k', JSON.stringify('fresh'), { EX: 60 });
        });
    });
});
