import { Inject, Injectable } from '@nestjs/common';
import type { Review } from '../../../domain/entities/review.entity';
import {
    REVIEW_REPOSITORY,
    type ReviewRepository,
} from '../../ports/review.repository.port';
import type { GetRestaurantReviewsCommand } from './get-restaurant-reviews.command';

@Injectable()
export class GetRestaurantReviewsUseCase {
    constructor(
        @Inject(REVIEW_REPOSITORY)
        private readonly reviewRepository: ReviewRepository,
    ) {}

    async execute(command: GetRestaurantReviewsCommand): Promise<Review[]> {
        return this.reviewRepository.findManyByRestaurantId(command.restaurantId, {
            page: command.page,
            limit: command.limit,
        });
    }
}
