import { Inject, Injectable } from '@nestjs/common';
import {
    ADMIN_REVIEW_READER,
    type AdminReviewReadModel,
    type AdminReviewReader,
} from '../../ports/admin-review-reader.port';
import type { GetAdminReviewsCommand } from './get-admin-reviews.command';

@Injectable()
export class GetAdminReviewsUseCase {
    constructor(
        @Inject(ADMIN_REVIEW_READER)
        private readonly reviewReader: AdminReviewReader,
    ) {}

    execute(command: GetAdminReviewsCommand): Promise<AdminReviewReadModel[]> {
        return this.reviewReader.findMany(command);
    }
}
