import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class MenuItemUpdatedEvent extends DomainEvent {
    constructor(
        public readonly restaurantId: string,
        public readonly menuItemId: string,
        public readonly actorUserId: string,
    ) {
        super();
    }
}
