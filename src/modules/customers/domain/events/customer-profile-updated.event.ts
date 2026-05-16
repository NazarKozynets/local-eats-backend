import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class CustomerProfileUpdatedEvent extends DomainEvent {
    constructor(
        public readonly profileId: string,
        public readonly userId: string,
    ) {
        super();
    }
}
