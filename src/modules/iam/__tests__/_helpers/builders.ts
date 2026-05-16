import { Account } from '../../domain/entities/account.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo';
import { Email } from '../../../../shared/domain/value-objects/email.vo';
import { PhoneNumber } from '../../../../shared/domain/value-objects/phone-number.vo';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';

export const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
export const TEST_EMAIL = 'user@example.com';
export const TEST_PHONE = '+380991112233';
export const TEST_BCRYPT_HASH = '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234';

export function buildUserId(): UUID {
    return UUID.create(TEST_USER_ID);
}

export function buildEmail(value: string = TEST_EMAIL): Email {
    return Email.create(value);
}

export function buildPhone(value: string = TEST_PHONE): PhoneNumber {
    return PhoneNumber.create(value);
}

export function buildPasswordHash(value: string = TEST_BCRYPT_HASH): PasswordHash {
    return PasswordHash.create(value);
}

type BuildUserOverrides = Partial<{
    id: UUID;
    email: Email | null;
    phone: PhoneNumber | null;
    passwordHash: PasswordHash | null;
    role: UserRole;
    status: UserStatus;
    emailVerifiedAt: Date | null;
    phoneVerifiedAt: Date | null;
    blockedUntil: Date | null;
    blockReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;

export function buildUser(overrides: BuildUserOverrides = {}): Account {
    const now = new Date('2026-01-01T00:00:00Z');

    return Account.restore({
        id: overrides.id ?? buildUserId(),
        email: overrides.email !== undefined ? overrides.email : buildEmail(),
        phone: overrides.phone !== undefined ? overrides.phone : null,
        passwordHash: overrides.passwordHash !== undefined ? overrides.passwordHash : buildPasswordHash(),
        role: overrides.role ?? UserRole.CUSTOMER,
        status: overrides.status ?? UserStatus.ACTIVE,
        emailVerifiedAt: overrides.emailVerifiedAt !== undefined ? overrides.emailVerifiedAt : null,
        phoneVerifiedAt: overrides.phoneVerifiedAt !== undefined ? overrides.phoneVerifiedAt : null,
        blockedUntil: overrides.blockedUntil !== undefined ? overrides.blockedUntil : null,
        blockReason: overrides.blockReason !== undefined ? overrides.blockReason : null,
        createdAt: overrides.createdAt ?? now,
        updatedAt: overrides.updatedAt ?? now,
    });
}
