import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class CustomerDefaultAddressChangedEvent extends DomainEvent {
    constructor(
        public readonly customerId: string,
        public readonly newDefaultAddressId: string,
    ) {
        super();
    }
}
