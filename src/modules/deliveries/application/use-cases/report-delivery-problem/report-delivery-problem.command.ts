import type { DeliveryProblemType } from '../../../domain/enums/delivery-problem-type.enum';

export class ReportDeliveryProblemCommand {
    readonly reporterUserId: string;
    readonly reporterRole: string;
    readonly orderId: string;
    readonly type: DeliveryProblemType;
    readonly description: string;

    private constructor(props: ReportDeliveryProblemCommand) { Object.assign(this, props); }

    static create(props: {
        reporterUserId: string;
        reporterRole: string;
        orderId: string;
        type: DeliveryProblemType;
        description: string;
    }): ReportDeliveryProblemCommand {
        return new ReportDeliveryProblemCommand(props);
    }
}
