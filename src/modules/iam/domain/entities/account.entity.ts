import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';
import {Email} from "../../../../shared/domain/value-objects/email.vo";
import {PhoneNumber} from "../../../../shared/domain/value-objects/phone-number.vo";
import {PasswordHash} from "../value-objects/password-hash.vo";
import {UUID} from "../../../../shared/domain/value-objects/uuid.vo";

type AccountProps = {
    id: UUID;

    email: Email | null;
    phone: PhoneNumber | null;
    passwordHash: PasswordHash | null;

    role: UserRole;
    status: UserStatus;

    emailVerifiedAt: Date | null;
    phoneVerifiedAt: Date | null;

    blockedUntil: Date | null;
    // blockReason: BlockReason | null; // todo: add block reason enum
    blockReason: string | null;

    createdAt: Date;
    updatedAt: Date;
};

type RegisterAccountProps = {
    id: UUID;
    email?: Email | null;
    phone?: PhoneNumber | null;
    passwordHash?: PasswordHash | null;
    role: UserRole;
};

type RestoreAccountProps = AccountProps;

export class Account {
    private constructor(private readonly props: AccountProps) {}

    static register(props: RegisterAccountProps): Account {
        const now = new Date();

        if (!props.email && !props.phone) {
            throw new Error('User must have email or phone');
        }

        return new Account({
            id: props.id,

            email: props.email ?? null,
            phone: props.phone ?? null,
            passwordHash: props.passwordHash ?? null,

            role: props.role,
            status: UserStatus.ACTIVE,

            emailVerifiedAt: null,
            phoneVerifiedAt: null,

            blockedUntil: null,
            blockReason: null,

            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: AccountProps): Account {
        return new Account(props);
    }

    public changeEmail(email: Email): void {
        this.props.email = email;
        this.props.emailVerifiedAt = null;
        this.touch();
    }

    public changePhone(phone: PhoneNumber): void {
        this.props.phone = phone;
        this.props.phoneVerifiedAt = null;
        this.touch();
    }

    public changePasswordHash(passwordHash: PasswordHash): void {
        if (this.isDeleted()) {
            throw new Error('Deleted user cannot change password');
        }

        this.props.passwordHash = passwordHash;
        this.touch();
    }

    public changeRole(role: UserRole): void {
        if (this.isDeleted()) {
            throw new Error('Deleted user cannot change role');
        }

        this.props.role = role;
        this.touch();
    }

    public markEmailAsVerified(): void {
        if (!this.props.email) {
            throw new Error('User does not have email');
        }

        this.props.emailVerifiedAt = new Date();
        this.touch();
    }

    public markPhoneAsVerified(): void {
        if (!this.props.phone) {
            throw new Error('User does not have phone number');
        }

        this.props.phoneVerifiedAt = new Date();
        this.touch();
    }

    public block(reason: string, blockedUntil: Date | null = null): void {
        if (this.isDeleted()) {
            throw new Error('Deleted user cannot be blocked');
        }

        if (this.isAdmin()) {
            throw new Error('Admin user cannot be blocked by this operation');
        }

        this.props.status = UserStatus.BLOCKED;
        this.props.blockReason = reason;
        this.props.blockedUntil = blockedUntil;
        this.touch();
    }

    public unblock(): void {
        if (this.isDeleted()) {
            throw new Error('Deleted user cannot be unblocked');
        }

        this.props.status = UserStatus.ACTIVE;
        this.props.blockReason = null;
        this.props.blockedUntil = null;
        this.touch();
    }

    public delete(): void {
        if (this.isDeleted()) {
            return;
        }

        this.props.status = UserStatus.DELETED;
        this.touch();
    }

    public makeProvider(): void {
        if (this.isDeleted()) {
            throw new Error('Deleted user cannot become provider');
        }

        if (this.isAdmin()) {
            throw new Error('Admin cannot become provider');
        }

        this.props.role = UserRole.PROVIDER;
        this.touch();
    }

    public canLogin(): boolean {
        if (this.props.status === UserStatus.DELETED) {
            return false;
        }

        if (this.props.status === UserStatus.BLOCKED) {
            if (!this.props.blockedUntil) {
                return false;
            }

            return this.props.blockedUntil.getTime() <= Date.now();
        }

        return true;
    }

    public isAdmin(): boolean {
        return this.props.role === UserRole.ADMIN;
    }

    public isProvider(): boolean {
        return this.props.role === UserRole.PROVIDER;
    }

    public isCustomer(): boolean {
        return this.props.role === UserRole.CUSTOMER;
    }

    public isDeleted(): boolean {
        return this.props.status === UserStatus.DELETED;
    }

    private touch(): void {
        this.props.updatedAt = new Date();
    }

    public get id(): UUID {
        return this.props.id;
    }

    public get email(): Email | null {
        return this.props.email;
    }

    public get phone(): PhoneNumber | null {
        return this.props.phone;
    }

    public get passwordHash(): PasswordHash | null {
        return this.props.passwordHash;
    }

    public get role(): UserRole {
        return this.props.role;
    }

    public get status(): UserStatus {
        return this.props.status;
    }

    public get emailVerifiedAt(): Date | null {
        return this.props.emailVerifiedAt;
    }

    public get phoneVerifiedAt(): Date | null {
        return this.props.phoneVerifiedAt;
    }

    public get blockedUntil(): Date | null {
        return this.props.blockedUntil;
    }

    public get blockReason(): string | null {
        return this.props.blockReason;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}