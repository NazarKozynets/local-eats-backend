import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class CourierRatingUpdatedEvent extends DomainEvent {
    constructor(
        public readonly courierId: string,
        public readonly ratingAvg: number,
        public readonly ratingCount: number,
    ) {
        super();
    }
}
