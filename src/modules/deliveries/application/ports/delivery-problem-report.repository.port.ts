import type { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import type { DeliveryProblemReport } from '../../domain/entities/delivery-problem-report.entity';

export const DELIVERY_PROBLEM_REPORT_REPOSITORY = Symbol('DELIVERY_PROBLEM_REPORT_REPOSITORY');

export interface DeliveryProblemReportRepository {
    findById(id: UUID): Promise<DeliveryProblemReport | null>;
    save(report: DeliveryProblemReport): Promise<void>;
}
