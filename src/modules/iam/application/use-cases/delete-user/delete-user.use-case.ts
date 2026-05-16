import {Inject, Injectable} from "@nestjs/common";
import {USER_REPOSITORY} from "../../../domain/repositories/account.repository";
import type {AccountRepository} from "../../../domain/repositories/account.repository";
import {UUID} from "../../../../../shared/domain/value-objects/uuid.vo";
import {DeleteUserCommand} from "./delete-user.command";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";

@Injectable()
export class DeleteUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: AccountRepository,
    ) {}

    async execute(command: DeleteUserCommand): Promise<void> {
        const user = await this.userRepository.findById(UUID.create(command.userId));

        if (!user) {
            throw new UserNotFoundError();
        }

        user.delete();

        await this.userRepository.save(user);
    }
}
