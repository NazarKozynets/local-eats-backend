import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class DeliveryProblemReportedEvent extends DomainEvent {
    constructor(
        public readonly problemReportId: string,
        public readonly orderId: string,
        public readonly reportedByUserId: string,
    ) { super(); }
}
