import {Inject, Injectable} from "@nestjs/common";
import {SESSION_REPOSITORY} from "../../../domain/repositories/session.repository";
import type {SessionRepository} from "../../../domain/repositories/session.repository";
import {LogoutAllSessionsCommand} from "./logout-all-sessions.command";
import type {LogoutAllSessionsResult} from "./logout-all-sessions.result";

@Injectable()
export class LogoutAllSessionsUseCase {
    constructor(
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: SessionRepository,
    ) {}

    async execute(command: LogoutAllSessionsCommand): Promise<LogoutAllSessionsResult> {
        await this.sessionRepository.revokeAllByUserId(
            command.userId,
            new Date(),
        );

        return {
            success: true,
        };
    }
}
