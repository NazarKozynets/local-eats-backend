import { Injectable } from "@nestjs/common";
import { UUID } from "../../../../shared/domain/value-objects/uuid.vo";
import {
    type AccountAccessReader,
    type AccountSnapshot,
} from "../../application/ports/account-access-reader.port";
import {PrismaService} from "../../../../shared/infrastructure/database/prisma.service";

@Injectable()
export class PrismaAccountAccessReader implements AccountAccessReader {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: UUID): Promise<AccountSnapshot | null> {
        const account = await this.prisma.user.findUnique({
            where: {
                id: id.value,
            },
            select: {
                id: true,
                status: true,
                role: true,
            },
        });

        if (!account) {
            return null;
        }

        return {
            id: account.id,
            status: account.status as AccountSnapshot['status'],
            role: account.role as unknown as AccountSnapshot['role'],
        };
    }
}