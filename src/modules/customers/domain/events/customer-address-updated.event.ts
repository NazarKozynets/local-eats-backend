import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class CustomerAddressUpdatedEvent extends DomainEvent {
    constructor(
        public readonly addressId: string,
        public readonly customerId: string,
    ) {
        super();
    }
}
