import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import type { DeliveryProblemReport } from '../../domain/entities/delivery-problem-report.entity';
import type { DeliveryProblemReportRepository } from '../../application/ports/delivery-problem-report.repository.port';
import { DeliveryProblemReportPrismaMapper } from './mappers/delivery-problem-report-prisma.mapper';

@Injectable()
export class PrismaDeliveryProblemReportRepository implements DeliveryProblemReportRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: UUID): Promise<DeliveryProblemReport | null> {
        const row = await this.prisma.deliveryProblemReport.findUnique({
            where: { id: id.value },
        });
        return row ? DeliveryProblemReportPrismaMapper.toDomain(row) : null;
    }

    async save(report: DeliveryProblemReport): Promise<void> {
        const data = DeliveryProblemReportPrismaMapper.toPersistence(report);
        await this.prisma.deliveryProblemReport.upsert({
            where: { id: data.id },
            create: data,
            update: {
                status: data.status,
                resolvedAt: data.resolvedAt,
                updatedAt: data.updatedAt,
            },
        });
    }
}
