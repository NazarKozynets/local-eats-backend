import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { AdminDeliveryProblemActionsPort } from '../../application/ports/admin-delivery-problem-actions.port';

@Injectable()
export class PrismaAdminDeliveryProblemActions implements AdminDeliveryProblemActionsPort {
    constructor(private readonly prisma: PrismaService) {}

    async resolve(problemId: string, resolvedAt: Date): Promise<void> {
        await this.prisma.deliveryProblemReport.update({
            where: { id: problemId },
            data: { status: 'RESOLVED', resolvedAt },
        });
    }
}
