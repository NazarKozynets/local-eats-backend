import {Inject, Injectable} from "@nestjs/common";
import {USER_REPOSITORY} from "../../../domain/repositories/account.repository";
import type {AccountRepository} from "../../../domain/repositories/account.repository";
import {PASSWORD_HASHER} from "../../services/password-hasher.port";
import type {PasswordHasher} from "../../services/password-hasher.port";
import {PasswordHash} from "../../../domain/value-objects/password-hash.vo";
import {UUID} from "../../../../../shared/domain/value-objects/uuid.vo";
import {ChangePasswordCommand} from "./change-password.command";
import {AccessDeniedError} from "../../../../../shared/domain/errors/access-denied.error";
import {InvalidCredentialsError} from "../../../../../shared/domain/errors/invalid-credentials.error";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";

@Injectable()
export class ChangePasswordUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: AccountRepository,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
    ) {}

    async execute(command: ChangePasswordCommand): Promise<void> {
        const user = await this.userRepository.findById(UUID.create(command.userId));

        if (!user) {
            throw new UserNotFoundError();
        }

        if (!user.passwordHash) {
            throw new AccessDeniedError({
                reason: "password_login_disabled",
            });
        }

        const isCurrentPasswordValid = await this.passwordHasher.compare(
            command.currentPassword,
            user.passwordHash.value,
        );

        if (!isCurrentPasswordValid) {
            throw new InvalidCredentialsError();
        }

        const passwordHash = PasswordHash.create(
            await this.passwordHasher.hash(command.newPassword),
        );

        user.changePasswordHash(passwordHash);

        await this.userRepository.save(user);
    }
}
