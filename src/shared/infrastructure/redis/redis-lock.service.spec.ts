import { RedisLockService } from './redis-lock.service';
import { ConfigService } from '@nestjs/config';

function makeClient(overrides: Partial<Record<string, jest.Mock>> = {}) {
    return {
        set: jest.fn(),
        eval: jest.fn(),
        ...overrides,
    } as any;
}

function makeConfig(prefix = 'test') {
    return { get: jest.fn().mockReturnValue(prefix) } as unknown as ConfigService;
}

describe('RedisLockService', () => {
    describe('acquire', () => {
        it('returns a lock handle when SET NX succeeds', async () => {
            // Arrange
            const client = makeClient({ set: jest.fn().mockResolvedValue('OK') });
            const svc = new RedisLockService(client, makeConfig());

            // Act
            const lock = await svc.acquire('order:create', 5000);

            // Assert
            expect(lock).not.toBeNull();
            expect(client.set).toHaveBeenCalledWith(
                expect.stringContaining('lock:order:create'),
                expect.any(String),
                { NX: true, PX: 5000 },
            );
        });

        it('returns null when lock is already held', async () => {
            // Arrange
            const client = makeClient({ set: jest.fn().mockResolvedValue(null) });
            const svc = new RedisLockService(client, makeConfig());

            // Act
            const lock = await svc.acquire('order:create', 5000);

            // Assert
            expect(lock).toBeNull();
        });

        it('returns null and swallows redis errors', async () => {
            // Arrange
            const client = makeClient({ set: jest.fn().mockRejectedValue(new Error('conn fail')) });
            const svc = new RedisLockService(client, makeConfig());

            // Act & Assert
            await expect(svc.acquire('order:create', 5000)).resolves.toBeNull();
        });
    });

    describe('release', () => {
        it('calls eval with Lua script and token', async () => {
            // Arrange
            const client = makeClient({
                set: jest.fn().mockResolvedValue('OK'),
                eval: jest.fn().mockResolvedValue(1),
            });
            const svc = new RedisLockService(client, makeConfig());

            // Act
            const lock = await svc.acquire('my-resource', 1000);
            await lock!.release();

            // Assert
            expect(client.eval).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    keys: expect.arrayContaining([expect.stringContaining('lock:my-resource')]),
                    arguments: expect.arrayContaining([expect.any(String)]),
                }),
            );
        });
    });
});
