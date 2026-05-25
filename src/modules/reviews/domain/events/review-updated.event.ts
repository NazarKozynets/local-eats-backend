import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';
import type { ReviewTarget } from '../enums/review-target.enum';

export class ReviewUpdatedEvent extends DomainEvent {
    constructor(
        public readonly reviewId: string,
        public readonly reviewerUserId: string,
        public readonly target: ReviewTarget,
        public readonly previousRating: number,
        public readonly newRating: number,
    ) {
        super();
    }
}
