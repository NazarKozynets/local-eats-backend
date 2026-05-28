import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class DeliveryAssignedEvent extends DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly courierProfileId: string,
        public readonly actorUserId: string,
    ) { super(); }
}
