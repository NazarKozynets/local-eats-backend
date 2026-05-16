import {Inject, Injectable} from "@nestjs/common";
import {USER_REPOSITORY} from "../../../domain/repositories/account.repository";
import type {AccountRepository} from "../../../domain/repositories/account.repository";
import {Account} from "../../../domain/entities/account.entity";
import {PasswordHash} from "../../../domain/value-objects/password-hash.vo";
import {UserRole} from "../../../domain/enums/user-role.enum";
import {RegisterCommand} from "./register.command";
import {Email} from "../../../../../shared/domain/value-objects/email.vo";
import {PhoneNumber} from "../../../../../shared/domain/value-objects/phone-number.vo";
import {UUID} from "../../../../../shared/domain/value-objects/uuid.vo";
import {PASSWORD_HASHER} from "../../services/password-hasher.port";
import type {PasswordHasher} from "../../services/password-hasher.port";
import {UserAlreadyExistsError} from "../../../../../shared/domain/errors/user-already-exists.error";

@Injectable()
export class RegisterUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: AccountRepository,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
    ) {}

    async execute(command: RegisterCommand): Promise<void> {
        const email = command.email ? Email.create(command.email) : null;
        const phone = command.phone ? PhoneNumber.create(command.phone) : null;

        if (email) {
            const existingUserByEmail = await this.userRepository.findByEmail(email);

            if (existingUserByEmail) {
                throw new UserAlreadyExistsError({
                    field: "email",
                });
            }
        }

        if (phone) {
            const existingUserByPhone = await this.userRepository.findByPhoneNumber(phone);

            if (existingUserByPhone) {
                throw new UserAlreadyExistsError({
                    field: "phone",
                });
            }
        }

        const passwordHashStr = await this.passwordHasher.hash(command.password);
        const passwordHash = PasswordHash.create(passwordHashStr);

        const user = Account.register({
            id: UUID.generate(),
            email,
            phone,
            passwordHash,
            role: UserRole.CUSTOMER,
        });

        await this.userRepository.save(user);
    }
}