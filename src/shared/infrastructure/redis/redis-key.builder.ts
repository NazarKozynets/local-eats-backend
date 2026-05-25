export class RedisKeyBuilder {
    static catalog(namespace: string, id: string): string {
        return `catalog:${namespace}:${id}`;
    }

    static lock(resource: string): string {
        return `lock:${resource}`;
    }
}
