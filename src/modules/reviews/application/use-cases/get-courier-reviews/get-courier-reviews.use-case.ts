import { Inject, Injectable } from '@nestjs/common';
import type { Review } from '../../../domain/entities/review.entity';
import {
    REVIEW_REPOSITORY,
    type ReviewRepository,
} from '../../ports/review.repository.port';
import type { GetCourierReviewsCommand } from './get-courier-reviews.command';

@Injectable()
export class GetCourierReviewsUseCase {
    constructor(
        @Inject(REVIEW_REPOSITORY)
        private readonly reviewRepository: ReviewRepository,
    ) {}

    async execute(command: GetCourierReviewsCommand): Promise<Review[]> {
        return this.reviewRepository.findManyByCourierId(command.courierId, {
            page: command.page,
            limit: command.limit,
        });
    }
}
