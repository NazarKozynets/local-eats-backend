import {Inject, Injectable} from "@nestjs/common";
import {USER_REPOSITORY} from "../../../domain/repositories/account.repository";
import type {AccountRepository} from "../../../domain/repositories/account.repository";
import {UUID} from "../../../../../shared/domain/value-objects/uuid.vo";
import {GetCurrentUserCommand} from "./get-current-user.command";
import type {GetCurrentUserResult} from "./get-current-user.result";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";

@Injectable()
export class GetCurrentUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: AccountRepository,
    ) {}

    async execute(command: GetCurrentUserCommand): Promise<GetCurrentUserResult> {
        const user = await this.userRepository.findById(UUID.create(command.userId));

        if (!user) {
            throw new UserNotFoundError();
        }

        return {
            id: user.id.value,
            email: user.email?.value ?? null,
            phone: user.phone?.value ?? null,
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
