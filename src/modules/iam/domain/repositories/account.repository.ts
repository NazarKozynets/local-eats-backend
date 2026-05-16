import {UUID} from "../../../../shared/domain/value-objects/uuid.vo";
import {Account} from "../entities/account.entity";
import {Email} from "../../../../shared/domain/value-objects/email.vo";
import {PhoneNumber} from "../../../../shared/domain/value-objects/phone-number.vo";

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

// Interface for user repository
export interface AccountRepository {
    findById(id: UUID): Promise<Account | null>;

    findByEmail(email: Email): Promise<Account | null>;
    findByPhoneNumber(phoneNumber: PhoneNumber): Promise<Account | null>;

    existsByEmail(email: Email): Promise<boolean>;
    existsByPhoneNumber(phoneNumber: PhoneNumber): Promise<boolean>;

    save(user: Account): Promise<void>;
}