import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class CourierSubmittedForVerificationEvent extends DomainEvent {
    constructor(
        public readonly courierProfileId: string,
        public readonly userId: string,
    ) {
        super();
    }
}
