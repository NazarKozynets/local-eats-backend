import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { DeliveryProblemReport } from '../../../domain/entities/delivery-problem-report.entity';
import type { DeliveryProblemType } from '../../../domain/enums/delivery-problem-type.enum';
import type { DeliveryProblemStatus } from '../../../domain/enums/delivery-problem-status.enum';

export class DeliveryProblemReportPrismaMapper {
    static toDomain(raw: any): DeliveryProblemReport {
        return DeliveryProblemReport.restore({
            id: UUID.create(raw.id),
            orderId: UUID.create(raw.orderId),
            reportedByUserId: UUID.create(raw.reportedByUserId),
            type: raw.type as DeliveryProblemType,
            status: raw.status as DeliveryProblemStatus,
            description: raw.description,
            resolvedAt: raw.resolvedAt ?? null,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static toPersistence(report: DeliveryProblemReport) {
        return {
            id: report.id.value,
            orderId: report.orderId.value,
            reportedByUserId: report.reportedByUserId.value,
            type: report.type,
            status: report.status,
            description: report.description,
            resolvedAt: report.resolvedAt,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
        };
    }
}
