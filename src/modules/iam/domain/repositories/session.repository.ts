export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export type CreateSessionProps = {
    userId: string;
    refreshTokenHash: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    deviceName?: string | null;
    expiresAt: Date;
};

export type UserSessionRecord = {
    id: string;
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
};

// Interface for session repository
export interface SessionRepository {
    create(props: CreateSessionProps): Promise<void>;
    findActiveByRefreshTokenHash(refreshTokenHash: string, now: Date): Promise<UserSessionRecord | null>;
    rotateRefreshTokenHash(currentRefreshTokenHash: string, newRefreshTokenHash: string, expiresAt: Date, rotatedAt: Date): Promise<void>;
    revokeByRefreshTokenHash(refreshTokenHash: string, revokedAt: Date): Promise<void>;
    revokeAllByUserId(userId: string, revokedAt: Date): Promise<void>;
}