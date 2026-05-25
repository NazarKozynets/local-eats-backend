export interface DistributedLock {
    release(): Promise<void>;
}

export interface DistributedLockPort {
    acquire(resource: string, ttlMs: number): Promise<DistributedLock | null>;
}
