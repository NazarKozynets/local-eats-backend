import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class MenuItemStatusChangedEvent extends DomainEvent {
    constructor(
        public readonly restaurantId: string,
        public readonly menuItemId: string,
        public readonly status: string,
        public readonly actorUserId: string,
    ) {
        super();
    }
}
