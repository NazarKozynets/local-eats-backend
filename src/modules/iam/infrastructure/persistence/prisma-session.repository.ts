import { Injectable } from '@nestjs/common';

import type {
    CreateSessionProps,
    SessionRepository,
    UserSessionRecord,
} from '../../domain/repositories/session.repository';
import {PrismaService} from "../../../../shared/infrastructure/database/prisma.service";

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async create(props: CreateSessionProps): Promise<void> {
        await this.prisma.userSession.create({
            data: {
                userId: props.userId,
                refreshTokenHash: props.refreshTokenHash,
                userAgent: props.userAgent ?? null,
                ipAddress: props.ipAddress ?? null,
                deviceName: props.deviceName ?? null,
                expiresAt: props.expiresAt,
            },
        });
    }

    async findActiveByRefreshTokenHash(
        refreshTokenHash: string,
        now: Date,
    ): Promise<UserSessionRecord | null> {
        const session = await this.prisma.userSession.findFirst({
            where: {
                refreshTokenHash,
                revokedAt: null,
                expiresAt: {
                    gt: now,
                },
            },
        });

        return session ? {
            id: session.id,
            userId: session.userId,
            refreshTokenHash: session.refreshTokenHash,
            expiresAt: session.expiresAt,
            revokedAt: session.revokedAt,
        } : null;
    }

    async rotateRefreshTokenHash(
        currentRefreshTokenHash: string,
        newRefreshTokenHash: string,
        expiresAt: Date,
        rotatedAt: Date,
    ): Promise<void> {
        await this.prisma.userSession.updateMany({
            where: {
                refreshTokenHash: currentRefreshTokenHash,
                revokedAt: null,
            },
            data: {
                refreshTokenHash: newRefreshTokenHash,
                expiresAt,
                lastUsedAt: rotatedAt,
            },
        });
    }

    async revokeByRefreshTokenHash(
        refreshTokenHash: string,
        revokedAt: Date,
    ): Promise<void> {
        const session = await this.prisma.userSession.findFirst({
            where: {
                refreshTokenHash,
                revokedAt: null,
                expiresAt: {
                    gt: revokedAt,
                },
            },
        });

        if (!session) {
            return;
        }

        await this.prisma.userSession.update({
            where: {
                id: session.id,
            },
            data: {
                revokedAt,
            },
        });
    }

    async revokeAllByUserId(userId: string, revokedAt: Date): Promise<void> {
        await this.prisma.userSession.updateMany({
            where: {
                userId,
                revokedAt: null,
                expiresAt: {
                    gt: revokedAt,
                },
            },
            data: {
                revokedAt,
            },
        });
    }
}