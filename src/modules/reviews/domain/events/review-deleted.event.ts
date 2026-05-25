import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';
import type { ReviewTarget } from '../enums/review-target.enum';

export class ReviewDeletedEvent extends DomainEvent {
    constructor(
        public readonly reviewId: string,
        public readonly reviewerUserId: string,
        public readonly target: ReviewTarget,
        public readonly restaurantId: string | null,
        public readonly courierId: string | null,
        public readonly rating: number,
    ) {
        super();
    }
}
