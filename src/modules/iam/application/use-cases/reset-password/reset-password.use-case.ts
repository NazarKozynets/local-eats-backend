import {Inject, Injectable} from "@nestjs/common";
import {USER_REPOSITORY} from "../../../domain/repositories/account.repository";
import type {AccountRepository} from "../../../domain/repositories/account.repository";
import {PASSWORD_HASHER} from "../../services/password-hasher.port";
import type {PasswordHasher} from "../../services/password-hasher.port";
import {PasswordHash} from "../../../domain/value-objects/password-hash.vo";
import {UUID} from "../../../../../shared/domain/value-objects/uuid.vo";
import {ResetPasswordCommand} from "./reset-password.command";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";

@Injectable()
export class ResetPasswordUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: AccountRepository,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
    ) {}

    async execute(command: ResetPasswordCommand): Promise<void> {
        const user = await this.userRepository.findById(UUID.create(command.userId));

        if (!user) {
            throw new UserNotFoundError();
        }

        const passwordHash = PasswordHash.create(
            await this.passwordHasher.hash(command.newPassword),
        );

        user.changePasswordHash(passwordHash);

        await this.userRepository.save(user);
    }
}
