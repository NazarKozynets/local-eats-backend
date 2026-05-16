import { Account } from '../../domain/entities/account.entity';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserStatus } from '../../domain/enums/user-status.enum';
import {UUID} from "../../../../shared/domain/value-objects/uuid.vo";
import {Email} from "../../../../shared/domain/value-objects/email.vo";
import {PhoneNumber} from "../../../../shared/domain/value-objects/phone-number.vo";

export class AccountMapper {
    static toDomain(raw: any): Account {
        return Account.restore({
            id: UUID.create(raw.id),
            email: raw.email ? Email.create(raw.email) : null,
            phone: raw.phone ? PhoneNumber.create(raw.phone) : null,
            passwordHash: raw.passwordHash ? PasswordHash.create(raw.passwordHash) : null,
            role: raw.role as UserRole,
            status: raw.status as UserStatus,
            emailVerifiedAt: raw.emailVerifiedAt,
            phoneVerifiedAt: raw.phoneVerifiedAt,
            blockedUntil: raw.blockedUntil,
            blockReason: raw.blockReason,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static toPersistence(user: Account) {
        return {
            id: user.id.value,
            email: user.email?.value,
            phone: user.phone?.value,
            passwordHash: user.passwordHash?.value,
            role: user.role,
            status: user.status,
            emailVerifiedAt: user.emailVerifiedAt,
            phoneVerifiedAt: user.phoneVerifiedAt,
            blockedUntil: user.blockedUntil,
            blockReason: user.blockReason,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}