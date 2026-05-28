import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class DeliveryProblemResolvedEvent extends DomainEvent {
    constructor(
        public readonly problemReportId: string,
        public readonly orderId: string,
        public readonly adminUserId: string,
    ) { super(); }
}
