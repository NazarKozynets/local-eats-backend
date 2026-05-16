import {Inject, Injectable} from "@nestjs/common";
import {USER_REPOSITORY} from "../../../domain/repositories/account.repository";
import type {AccountRepository} from "../../../domain/repositories/account.repository";
import {UUID} from "../../../../../shared/domain/value-objects/uuid.vo";
import {VerifyPhoneCommand} from "./verify-phone.command";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";

@Injectable()
export class VerifyPhoneUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: AccountRepository,
    ) {}

    async execute(command: VerifyPhoneCommand): Promise<void> {
        const user = await this.userRepository.findById(UUID.create(command.userId));

        if (!user) {
            throw new UserNotFoundError();
        }

        user.markPhoneAsVerified();

        await this.userRepository.save(user);
    }
}
