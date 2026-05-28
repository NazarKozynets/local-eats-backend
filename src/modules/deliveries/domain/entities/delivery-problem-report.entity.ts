import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { DeliveryProblemType } from '../enums/delivery-problem-type.enum';
import { DeliveryProblemStatus } from '../enums/delivery-problem-status.enum';
import { DeliveryProblemAlreadyResolvedError } from '../errors/delivery-problem-already-resolved.error';

type DeliveryProblemReportProps = {
    id: UUID;
    orderId: UUID;
    reportedByUserId: UUID;
    type: DeliveryProblemType;
    status: DeliveryProblemStatus;
    description: string;
    resolvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

type CreateDeliveryProblemReportProps = {
    id: UUID;
    orderId: UUID;
    reportedByUserId: UUID;
    type: DeliveryProblemType;
    description: string;
};

export class DeliveryProblemReport {
    private constructor(private readonly props: DeliveryProblemReportProps) {}

    static create(p: CreateDeliveryProblemReportProps): DeliveryProblemReport {
        const now = new Date();
        return new DeliveryProblemReport({
            id: p.id,
            orderId: p.orderId,
            reportedByUserId: p.reportedByUserId,
            type: p.type,
            status: DeliveryProblemStatus.OPEN,
            description: p.description,
            resolvedAt: null,
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: DeliveryProblemReportProps): DeliveryProblemReport {
        return new DeliveryProblemReport(props);
    }

    resolve(now: Date): void {
        if (this.props.status !== DeliveryProblemStatus.OPEN) {
            throw new DeliveryProblemAlreadyResolvedError();
        }
        this.props.status = DeliveryProblemStatus.RESOLVED;
        this.props.resolvedAt = now;
        this.props.updatedAt = now;
    }

    get id(): UUID { return this.props.id; }
    get orderId(): UUID { return this.props.orderId; }
    get reportedByUserId(): UUID { return this.props.reportedByUserId; }
    get type(): DeliveryProblemType { return this.props.type; }
    get status(): DeliveryProblemStatus { return this.props.status; }
    get description(): string { return this.props.description; }
    get resolvedAt(): Date | null { return this.props.resolvedAt; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }
}
