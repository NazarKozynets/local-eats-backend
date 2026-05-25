import { RedisKeyBuilder } from './redis-key.builder';

describe('RedisKeyBuilder', () => {
    describe('catalog', () => {
        it('builds catalog key with namespace and id', () => {
            expect(RedisKeyBuilder.catalog('public', 'rest-123')).toBe('catalog:public:rest-123');
        });
    });

    describe('lock', () => {
        it('builds lock key for a resource', () => {
            expect(RedisKeyBuilder.lock('order:create')).toBe('lock:order:create');
        });
    });
});
