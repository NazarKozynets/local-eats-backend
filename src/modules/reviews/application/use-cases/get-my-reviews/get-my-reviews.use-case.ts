import { Inject, Injectable } from '@nestjs/common';
import type { Review } from '../../../domain/entities/review.entity';
import {
    REVIEW_REPOSITORY,
    type ReviewRepository,
} from '../../ports/review.repository.port';
import type { GetMyReviewsCommand } from './get-my-reviews.command';

@Injectable()
export class GetMyReviewsUseCase {
    constructor(
        @Inject(REVIEW_REPOSITORY)
        private readonly reviewRepository: ReviewRepository,
    ) {}

    async execute(command: GetMyReviewsCommand): Promise<Review[]> {
        return this.reviewRepository.findManyByReviewerUserId(command.currentUserId, {
            page: command.page,
            limit: command.limit,
        });
    }
}
