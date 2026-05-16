import {Inject, Injectable} from "@nestjs/common";
import {USER_REPOSITORY} from "../../../domain/repositories/account.repository";
import type {AccountRepository} from "../../../domain/repositories/account.repository";
import {UUID} from "../../../../../shared/domain/value-objects/uuid.vo";
import {RequestPhoneVerificationCommand} from "./request-phone-verification.command";
import type {RequestPhoneVerificationResult} from "./request-phone-verification.result";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";

@Injectable()
export class RequestPhoneVerificationUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: AccountRepository,
    ) {}

    async execute(command: RequestPhoneVerificationCommand): Promise<RequestPhoneVerificationResult> {
        const user = await this.userRepository.findById(UUID.create(command.userId));

        if (!user) {
            throw new UserNotFoundError();
        }

        if (!user.phone) {
            throw new UserNotFoundError({
                field: "phone",
            });
        }

        return {
            success: true,
        };
    }
}
