import type { AccountRepository } from '../../domain/repositories/account.repository';
import type { SessionRepository } from '../../domain/repositories/session.repository';
import type { PasswordHasher } from '../../application/services/password-hasher.port';
import type { TokenGenerator } from '../../application/services/token-generator.port';
import type { TokenHasher } from '../../application/services/token-hasher.port';
import type { AccountAccessReader } from '../../application/ports/account-access-reader.port';

export function createMockUserRepository(): jest.Mocked<AccountRepository> {
    return {
        findById: jest.fn(),
        findByEmail: jest.fn(),
        findByPhoneNumber: jest.fn(),
        existsByEmail: jest.fn(),
        existsByPhoneNumber: jest.fn(),
        save: jest.fn(),
    };
}

export function createMockSessionRepository(): jest.Mocked<SessionRepository> {
    return {
        create: jest.fn(),
        findActiveByRefreshTokenHash: jest.fn(),
        rotateRefreshTokenHash: jest.fn(),
        revokeByRefreshTokenHash: jest.fn(),
        revokeAllByUserId: jest.fn(),
    };
}

export function createMockPasswordHasher(): jest.Mocked<PasswordHasher> {
    return {
        hash: jest.fn(),
        compare: jest.fn(),
    };
}

export function createMockTokenGenerator(): jest.Mocked<TokenGenerator> {
    return {
        generateAccessToken: jest.fn(),
        generateRefreshToken: jest.fn(),
    };
}

export function createMockTokenHasher(): jest.Mocked<TokenHasher> {
    return {
        hash: jest.fn(),
    };
}

export function createMockAccountAccessReader(): jest.Mocked<AccountAccessReader> {
    return {
        findById: jest.fn(),
    };
}
