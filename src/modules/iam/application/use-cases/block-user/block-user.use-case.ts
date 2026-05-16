import {Inject, Injectable} from "@nestjs/common";
import {USER_REPOSITORY} from "../../../domain/repositories/account.repository";
import type {AccountRepository} from "../../../domain/repositories/account.repository";
import {UUID} from "../../../../../shared/domain/value-objects/uuid.vo";
import {BlockUserCommand} from "./block-user.command";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";

@Injectable()
export class BlockUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: AccountRepository,
    ) {}

    async execute(command: BlockUserCommand): Promise<void> {
        const user = await this.userRepository.findById(UUID.create(command.userId));

        if (!user) {
            throw new UserNotFoundError();
        }

        user.block(command.reason, command.blockedUntil);

        await this.userRepository.save(user);
    }
}
