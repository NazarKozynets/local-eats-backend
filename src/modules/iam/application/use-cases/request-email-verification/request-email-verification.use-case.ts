import {Inject, Injectable} from "@nestjs/common";
import {USER_REPOSITORY} from "../../../domain/repositories/account.repository";
import type {AccountRepository} from "../../../domain/repositories/account.repository";
import {UUID} from "../../../../../shared/domain/value-objects/uuid.vo";
import {RequestEmailVerificationCommand} from "./request-email-verification.command";
import type {RequestEmailVerificationResult} from "./request-email-verification.result";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";

@Injectable()
export class RequestEmailVerificationUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: AccountRepository,
    ) {}

    async execute(command: RequestEmailVerificationCommand): Promise<RequestEmailVerificationResult> {
        const user = await this.userRepository.findById(UUID.create(command.userId));

        if (!user) {
            throw new UserNotFoundError();
        }

        if (!user.email) {
            throw new UserNotFoundError({
                field: "email",
            });
        }

        return {
            success: true,
        };
    }
}
