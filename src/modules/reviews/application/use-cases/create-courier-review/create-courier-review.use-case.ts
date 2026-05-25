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
import { CourierNotAssignedToOrderError } from '../../../domain/errors/courier-not-assigned-to-order.error';
import { CourierReviewCreatedEvent } from '../../../domain/events/courier-review-created.event';
import { CourierRatingUpdatedEvent } from '../../../domain/events/courier-rating-updated.event';
import {
    REVIEW_REPOSITORY,
    type ReviewRepository,
} from '../../ports/review.repository.port';
import {
    ORDER_REVIEW_READER,
    type OrderReviewReader,
} from '../../ports/order-review-reader.port';
import {
    COURIER_RATING_WRITER,
    type CourierRatingWriter,
} from '../../ports/courier-rating-writer.port';
import type { CreateCourierReviewCommand } from './create-courier-review.command';

@Injectable()
export class CreateCourierReviewUseCase {
    constructor(
        @Inject(REVIEW_REPOSITORY)
        private readonly reviewRepository: ReviewRepository,
        @Inject(ORDER_REVIEW_READER)
        private readonly orderReviewReader: OrderReviewReader,
        @Inject(COURIER_RATING_WRITER)
        private readonly courierRatingWriter: CourierRatingWriter,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: CreateCourierReviewCommand): Promise<void> {
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

        if (!order.courierId) {
            throw new CourierNotAssignedToOrderError();
        }

        const alreadyExists = await this.reviewRepository.existsByOrderIdAndTarget(
            command.orderId,
            ReviewTarget.COURIER,
        );
        if (alreadyExists) {
            throw new ReviewAlreadyExistsError();
        }

        const review = Review.createCourierReview({
            id: UUID.generate(),
            orderId: UUID.create(command.orderId),
            reviewerUserId: UUID.create(command.currentUserId),
            customerId: UUID.create(order.customerId),
            courierId: UUID.create(order.courierId),
            rating: command.rating,
            comment: command.comment ?? null,
        });

        await this.reviewRepository.save(review);

        const ratingStats = await this.reviewRepository.calculateCourierRating(order.courierId);
        await this.courierRatingWriter.updateRating(
            order.courierId,
            ratingStats.ratingAvg,
            ratingStats.ratingCount,
        );

        await this.eventPublisher.publishAll([
            new CourierReviewCreatedEvent(
                review.id.value,
                order.orderId,
                command.currentUserId,
                order.customerId,
                order.courierId,
                command.rating,
            ),
            new CourierRatingUpdatedEvent(
                order.courierId,
                ratingStats.ratingAvg,
                ratingStats.ratingCount,
            ),
        ]);
    }
}
