import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../../../../shared/domain/events/domain-event.base';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import { ReviewTarget } from '../../../domain/enums/review-target.enum';
import { ReviewNotFoundError } from '../../../domain/errors/review-not-found.error';
import { ReviewAccessDeniedError } from '../../../domain/errors/review-access-denied.error';
import { ReviewUpdatedEvent } from '../../../domain/events/review-updated.event';
import { RestaurantRatingUpdatedEvent } from '../../../domain/events/restaurant-rating-updated.event';
import { CourierRatingUpdatedEvent } from '../../../domain/events/courier-rating-updated.event';
import {
    REVIEW_REPOSITORY,
    type ReviewRepository,
} from '../../ports/review.repository.port';
import {
    RESTAURANT_RATING_WRITER,
    type RestaurantRatingWriter,
} from '../../ports/restaurant-rating-writer.port';
import {
    COURIER_RATING_WRITER,
    type CourierRatingWriter,
} from '../../ports/courier-rating-writer.port';
import type { UpdateReviewCommand } from './update-review.command';

@Injectable()
export class UpdateReviewUseCase {
    constructor(
        @Inject(REVIEW_REPOSITORY)
        private readonly reviewRepository: ReviewRepository,
        @Inject(RESTAURANT_RATING_WRITER)
        private readonly restaurantRatingWriter: RestaurantRatingWriter,
        @Inject(COURIER_RATING_WRITER)
        private readonly courierRatingWriter: CourierRatingWriter,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: UpdateReviewCommand): Promise<void> {
        const review = await this.reviewRepository.findById(UUID.create(command.reviewId));

        if (!review) {
            throw new ReviewNotFoundError();
        }

        if (!review.belongsToReviewer(command.currentUserId)) {
            throw new ReviewAccessDeniedError();
        }

        const previousRating = review.rating;

        if (command.rating !== undefined) {
            review.updateRating(command.rating);
        }

        if (command.comment !== undefined) {
            review.updateComment(command.comment ?? null);
        }

        await this.reviewRepository.update(review);

        const ratingChanged = command.rating !== undefined && command.rating !== previousRating;
        const events: DomainEvent[] = [
            new ReviewUpdatedEvent(
                review.id.value,
                command.currentUserId,
                review.target,
                previousRating,
                review.rating,
            ),
        ];

        if (ratingChanged) {
            if (review.target === ReviewTarget.RESTAURANT && review.restaurantId) {
                const stats = await this.reviewRepository.calculateRestaurantRating(
                    review.restaurantId.value,
                );
                await this.restaurantRatingWriter.updateRating(
                    review.restaurantId.value,
                    stats.ratingAvg,
                    stats.ratingCount,
                );
                events.push(
                    new RestaurantRatingUpdatedEvent(
                        review.restaurantId.value,
                        stats.ratingAvg,
                        stats.ratingCount,
                    ),
                );
            }

            if (review.target === ReviewTarget.COURIER && review.courierId) {
                const stats = await this.reviewRepository.calculateCourierRating(
                    review.courierId.value,
                );
                await this.courierRatingWriter.updateRating(
                    review.courierId.value,
                    stats.ratingAvg,
                    stats.ratingCount,
                );
                events.push(
                    new CourierRatingUpdatedEvent(
                        review.courierId.value,
                        stats.ratingAvg,
                        stats.ratingCount,
                    ),
                );
            }
        }

        await this.eventPublisher.publishAll(events);
    }
}
