import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import { Review } from '../../../domain/entities/review.entity';
import { ReviewTarget } from '../../../domain/enums/review-target.enum';
import { OrderNotReviewableError } from '../../../domain/errors/order-not-reviewable.error';
import { OrderReviewAccessDeniedError } from '../../../domain/errors/order-review-access-denied.error';
import { ReviewAlreadyExistsError } from '../../../domain/errors/review-already-exists.error';
import { RestaurantReviewCreatedEvent } from '../../../domain/events/restaurant-review-created.event';
import { RestaurantRatingUpdatedEvent } from '../../../domain/events/restaurant-rating-updated.event';
import {
    REVIEW_REPOSITORY,
    type ReviewRepository,
} from '../../ports/review.repository.port';
import {
    ORDER_REVIEW_READER,
    type OrderReviewReader,
} from '../../ports/order-review-reader.port';
import {
    RESTAURANT_RATING_WRITER,
    type RestaurantRatingWriter,
} from '../../ports/restaurant-rating-writer.port';
import type { CreateRestaurantReviewCommand } from './create-restaurant-review.command';

@Injectable()
export class CreateRestaurantReviewUseCase {
    constructor(
        @Inject(REVIEW_REPOSITORY)
        private readonly reviewRepository: ReviewRepository,
        @Inject(ORDER_REVIEW_READER)
        private readonly orderReviewReader: OrderReviewReader,
        @Inject(RESTAURANT_RATING_WRITER)
        private readonly restaurantRatingWriter: RestaurantRatingWriter,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: CreateRestaurantReviewCommand): Promise<void> {
        const order = await this.orderReviewReader.findOrderForReview(command.orderId);

        if (!order) {
            throw new OrderNotReviewableError('Order not found or not available for review');
        }

        if (order.status !== 'DELIVERED') {
            throw new OrderNotReviewableError('Order must be DELIVERED before it can be reviewed');
        }

        if (order.reviewerUserId !== command.currentUserId) {
            throw new OrderReviewAccessDeniedError();
        }

        const alreadyExists = await this.reviewRepository.existsByOrderIdAndTarget(
            command.orderId,
            ReviewTarget.RESTAURANT,
        );
        if (alreadyExists) {
            throw new ReviewAlreadyExistsError();
        }

        const review = Review.createRestaurantReview({
            id: UUID.generate(),
            orderId: UUID.create(command.orderId),
            reviewerUserId: UUID.create(command.currentUserId),
            customerId: UUID.create(order.customerId),
            restaurantId: UUID.create(order.restaurantId),
            rating: command.rating,
            comment: command.comment ?? null,
        });

        await this.reviewRepository.save(review);

        const ratingStats = await this.reviewRepository.calculateRestaurantRating(order.restaurantId);
        await this.restaurantRatingWriter.updateRating(
            order.restaurantId,
            ratingStats.ratingAvg,
            ratingStats.ratingCount,
        );

        await this.eventPublisher.publishAll([
            new RestaurantReviewCreatedEvent(
                review.id.value,
                order.orderId,
                command.currentUserId,
                order.customerId,
                order.restaurantId,
                command.rating,
            ),
            new RestaurantRatingUpdatedEvent(
                order.restaurantId,
                ratingStats.ratingAvg,
                ratingStats.ratingCount,
            ),
        ]);
    }
}
