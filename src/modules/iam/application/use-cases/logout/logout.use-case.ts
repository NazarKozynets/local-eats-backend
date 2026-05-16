import {Inject, Injectable} from '@nestjs/common';

import {
    SESSION_REPOSITORY,
} from '../../../domain/repositories/session.repository';
import type {SessionRepository} from '../../../domain/repositories/session.repository';

import {
    TOKEN_HASHER,
} from '../../services/token-hasher.port';
import type {TokenHasher} from '../../services/token-hasher.port';

import {LogoutCommand} from './logout.command';
import type {LogoutResult} from './logout.result';

@Injectable()
export class LogoutUseCase {
    constructor(
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: SessionRepository,
        @Inject(TOKEN_HASHER)
        private readonly tokenHasher: TokenHasher,
    ) {
    }

    async execute(command: LogoutCommand): Promise<LogoutResult> {
        const refreshTokenHash = this.tokenHasher.hash(command.refreshToken);

        await this.sessionRepository.revokeByRefreshTokenHash(
            refreshTokenHash,
            new Date(),
        );

        return {
            success: true,
        };
    }
}