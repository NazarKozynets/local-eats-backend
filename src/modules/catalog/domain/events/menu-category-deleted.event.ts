import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class MenuCategoryDeletedEvent extends DomainEvent {
    constructor(
        public readonly restaurantId: string,
        public readonly categoryId: string,
        public readonly actorUserId: string,
    ) {
        super();
    }
}
