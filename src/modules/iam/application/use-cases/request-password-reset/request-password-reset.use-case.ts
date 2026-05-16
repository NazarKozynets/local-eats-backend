import {Inject, Injectable} from "@nestjs/common";
import {USER_REPOSITORY} from "../../../domain/repositories/account.repository";
import type {AccountRepository} from "../../../domain/repositories/account.repository";
import {Email} from "../../../../../shared/domain/value-objects/email.vo";
import {PhoneNumber} from "../../../../../shared/domain/value-objects/phone-number.vo";
import {RequestPasswordResetCommand} from "./request-password-reset.command";
import type {RequestPasswordResetResult} from "./request-password-reset.result";

@Injectable()
export class RequestPasswordResetUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: AccountRepository,
    ) {}

    async execute(command: RequestPasswordResetCommand): Promise<RequestPasswordResetResult> {
        if (this.isEmail(command.identifier)) {
            await this.userRepository.findByEmail(Email.create(command.identifier));
        } else {
            await this.userRepository.findByPhoneNumber(PhoneNumber.create(command.identifier));
        }

        // Avoid exposing whether the account exists.
        return {
            success: true,
        };
    }

    private isEmail(value: string): boolean {
        return value.includes('@');
    }
}
